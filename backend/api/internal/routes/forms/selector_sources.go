package forms

import (
	"api/internal/types"
	"bufio"
	"errors"
	"fmt"
	"net/http"
	"shared/logger"
	"shared/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	mlhSchoolUrl = "https://raw.githubusercontent.com/MLH/mlh-policies/main/schools.csv"
)

// Source Descriptors
var (
	mlhSchoolDescription = fmt.Sprintf("The MLH School list is a list that MLH maintains of all schools they recognize. They require their hackathons to use this list on their application forms. The full list is accessible here: %s ", mlhSchoolUrl)
)

func RegisterDefaultSelectorValues(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("selector_sources/values/:source_name", valuesFromSource(params))
	r.GET("selector_sources", availableDefaultSelectors(params))
}

func availableDefaultSelectors(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		sources, err := params.MongoService.ListSelectorSources(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list available sources"})
		}

		c.JSON(http.StatusOK, gin.H{"sources": sources})
	}
}

func getMLHSchools() ([]string, error) {
	// Make HTTP GET request
	resp, err := http.Get(mlhSchoolUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the request was successful
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("request failed")
	}

	// Read the response body
	scanner := bufio.NewScanner(resp.Body)
	schools := []string{}
	for scanner.Scan() {
		line := scanner.Text()
		schools = append(schools, line)
	}

	// Get rid of first element (header row)
	schools = schools[1:]

	return schools, nil
}

func valuesFromSource(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		sourceName := c.Param("source_name")

		// Allowed sources
		allowedSources := []string{"mlh-schools"}
		allowed := false
		for _, allowedSource := range allowedSources {
			if sourceName == allowedSource {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid source name"})
			return
		}

		source, err := params.MongoService.GetSourceByName(c, sourceName)
		refreshSource := false
		addSource := false
		if err != nil {
			if err == mongo.ErrNoDocuments {
				addSource = true
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
				return
			}
		}

		if source == nil {
			refreshSource = true
		}

		// check if source updated in last 24h
		if !addSource {
			lastUpdated := source.LastUpdated
			now := time.Now()
			diff := now.Sub(lastUpdated)
			if diff.Hours() > 24 {
				refreshSource = true
			}
		}

		// We haven't cached the source yet, so we need to fetch it from the external source
		// This probably should be abstracted out into a setup script or something, but for now it's
		// fine to just do it here
		if addSource || refreshSource {
			switch sourceName {
			case "mlh-schools":
				schools, err := getMLHSchools()
				if err != nil {
					// if we failed but we were just trying to refresh the options lets use the old ones
					if !addSource && refreshSource && source != nil && len(source.Options) > 0 {
						logger.LogWarning(fmt.Sprintf("Failed to refresh selector source name: %s\nError: %e", sourceName, err))
						c.JSON(http.StatusOK, source.Options)
						return
					}

					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
					return
				}

				// Create the source
				newSource := models.SelectorSource{
					Description: mlhSchoolDescription,
					SourceName:  sourceName,
					LastUpdated: time.Now(),
					Options:     schools,
				}

				if addSource {
					_, err = params.MongoService.CreateSource(c, newSource)
					if err != nil {
						fmt.Println(err)
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
						return
					}
				} else if refreshSource {
					_, err = params.MongoService.UpdateSource(c, newSource, source.ID)
					if err != nil {
						fmt.Println(err)
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
						return
					}
				}

				c.JSON(http.StatusOK, schools)
				return
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source, is it valid?"})
				return
			}
		}

		c.JSON(http.StatusOK, source.Options)
	}
}
