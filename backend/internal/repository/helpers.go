package repository

import (
	"go.mongodb.org/mongo-driver/mongo/options"
)

func optionsFindDesc(field string) *options.FindOptions {
	return options.Find().SetSort(map[string]int{field: -1})
}

func optionsFindAsc(field string) *options.FindOptions {
	return options.Find().SetSort(map[string]int{field: 1})
}
