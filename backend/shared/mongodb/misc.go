package mongodb

import (
	"reflect"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

// RemoveNonOverridableFields removes fields from the update payload that have the MongoPreventOverride tag set to "true".
func RemoveNonOverridableFields(update bson.M, model interface{}) bson.M {
	val := reflect.ValueOf(model)
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		if !field.IsExported() {
			continue
		}
		bsonTag := field.Tag.Get("bson")
		mongoPreventOverride := field.Tag.Get("mongoPreventOverride")

		// Split the bson tag to get the field name
		bsonFieldName := bsonTag
		if commaIndex := len(bsonTag); commaIndex > 0 {
			parts := strings.Split(bsonTag, ",")
			if len(parts) > 0 {
				bsonFieldName = parts[0]
			}
		}

		// Remove field from update payload if MongoPreventOverride is "true"
		if mongoPreventOverride == "true" {
			delete(update, bsonFieldName)
		}
	}

	return update
}
