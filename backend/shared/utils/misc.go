package utils

import (
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

		if !fieldType.IsExported() {
			continue
		}

		bsonTag := fieldType.Tag.Get("bson")
		if bsonTag == "" || bsonTag == "-" {
			continue
		}

		// Split the bson tag to get the field name
		bsonTagParts := strings.Split(bsonTag, ",")
		bsonFieldName := bsonTagParts[0]

		// Skip zero values if omitempty is present
		if len(bsonTagParts) > 1 && bsonTagParts[1] == "omitempty" && reflect.DeepEqual(field.Interface(), reflect.Zero(field.Type()).Interface()) {
			continue
		}

		result[bsonFieldName] = field.Interface()
	}

	return result
}

// ConvertMapStringToMapInterface converts a map[string]string to a map[string]interface{}
func ConvertMapStringToMapInterface(input map[string]string) map[string]interface{} {
	output := make(map[string]interface{})
	for key, value := range input {
		output[key] = value
	}
	return output
}
