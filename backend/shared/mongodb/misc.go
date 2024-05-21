package mongodb

import (
	"reflect"

	"go.mongodb.org/mongo-driver/bson"
)

// RemoveNonOverridableFields removes fields from the update payload that have the MongoPreventOverride tag set to "true"
func RemoveNonOverridableFields(update bson.M, model interface{}) bson.M {
	val := reflect.ValueOf(model)
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		bsonTag := field.Tag.Get("bson")
		mongoPreventOverride := field.Tag.Get("MongoPreventOverride")

		// Split the bson tag to get the field name
		bsonFieldName := bsonTag
		if commaIndex := len(bsonTag); commaIndex > 0 {
			bsonFieldName = bsonTag[:commaIndex]
		}

		// Remove field from update payload if MongoPreventOverride is "true"
		if mongoPreventOverride == "true" {
			delete(update, bsonFieldName)
		}
	}

	return update
}
