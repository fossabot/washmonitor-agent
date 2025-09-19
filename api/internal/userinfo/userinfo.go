package userinfo

import "os"

type UserInfo struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

func GetUserInfo(userNum int) UserInfo {
	var nameVar, colorVar string
	if userNum == 1 {
		nameVar = "USER1_NAME"
		colorVar = "USER1_COLOR"
	} else {
		nameVar = "USER2_NAME"
		colorVar = "USER2_COLOR"
	}
	name := os.Getenv(nameVar)
	color := os.Getenv(colorVar)
	return UserInfo{Name: name, Color: color}
}
