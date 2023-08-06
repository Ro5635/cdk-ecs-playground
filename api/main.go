package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "hi, this is a thing",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{})
	})

	r.Run()
}
