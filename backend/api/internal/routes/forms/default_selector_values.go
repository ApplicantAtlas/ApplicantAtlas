package forms

import (
	"api/internal/types"
	"bufio"
	"errors"
	"fmt"
	"net/http"
	"shared/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterDefaultSelectorValues(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET("default_selector_values/:source_name", valuesFromSource(params))
}

func getMLHSchools() ([]string, error) {
	mlhSchoolUrl := "https://raw.githubusercontent.com/MLH/mlh-policies/main/schools.csv"

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
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
					return
				}

				// Create the source
				newSource := models.SelectorSource{
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
			default:
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve source"})
			}
		}

		c.JSON(http.StatusOK, source.Options)
	}
}
