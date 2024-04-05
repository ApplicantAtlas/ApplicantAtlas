package kafka

import "shared/models"

func FieldChangeCheck(
	fieldChange *models.FieldChange,
	newData *map[string]interface{},
) bool {
	condition := fieldChange.Condition
	newValue, newExists := (*newData)[fieldChange.OnFieldID]

	if !newExists {
		return false
	}

	switch condition.Comparison {
	case models.ComparisonEq:
		return newValue == condition.Value
	case models.ComparisonNeq:
		return newValue != condition.Value
	default:
		return false
	}

}
