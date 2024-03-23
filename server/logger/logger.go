package logger

import (
	"io"
	"log/slog"
	"os"
	"sync"
)

var logger *slog.Logger
var once sync.Once

func GetInstance() *slog.Logger {
	once.Do(func() {
		f, _ := os.Create("tcctl.log")
		logger = slog.New(
			slog.NewTextHandler(io.MultiWriter(f, os.Stdout), nil),
		)
	})
	return logger
}
