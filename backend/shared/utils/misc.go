package utils

import (
	"fmt"
	"os"
	"reflect"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

func RunningInAWSLambda() bool {
	// AWS Lambda sets some specific environment variables
	// You can check for the existence of one of them.
	return os.Getenv("AWS_LAMBDA_FUNCTION_NAME") != "" // Note: untested
}

func GetBSONFieldNames(structType reflect.Type) []string {
	var fieldNames []string
	for i := 0; i < structType.NumField(); i++ {
		field := structType.Field(i)
		bsonTag := field.Tag.Get("bson")
		fmt.Println(field)
		if bsonTag == "" || bsonTag == "-" {
			// Use field name if json tag is not specified or is "-"
			fieldNames = append(fieldNames, field.Name)
		} else {
			// Otherwise, use the json tag
			fieldNames = append(fieldNames, strings.Split(bsonTag, ",")[0])
		}
	}
	return fieldNames
}

func RemoveStringsFromSlice(slice []string, s []string) []string {
	var result []string
	for _, str := range slice {
		if !StringInSlice(str, s) {
			result = append(result, str)
		}
	}
	return result
}

func StringInSlice(str string, slice []string) bool {
	for _, s := range slice {
		if str == s {
			return true
		}
	}
	return false
}

// StructToBsonM converts a struct to bson.M
func StructToBsonM(model interface{}) bson.M {
	val := reflect.ValueOf(model)
	typ := val.Type()

	result := bson.M{}
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)
		bsonTag := fieldType.Tag.Get("bson")

		// Split the bson tag to get the field name
		bsonFieldName := bsonTag
		if commaIndex := len(bsonTag); commaIndex > 0 {
			bsonFieldName = bsonTag[:commaIndex]
		}

		// Skip empty or omitted bson field names
		if bsonFieldName == "-" || bsonFieldName == "" {
			continue
		}

		// Add to result
		result[bsonFieldName] = field.Interface()
	}

	return result
}
