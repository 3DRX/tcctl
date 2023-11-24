TARGET_DIR = ./build

build:
	@echo "Building..."
	@rm -rf $(TARGET_DIR)
	@mkdir -p $(TARGET_DIR)
	@cd ./webui && npm run build
	@cp -r ./webui/dist $(TARGET_DIR)/dist
	@cp ./server.py ./tcctl.py $(TARGET_DIR)
	@cp ./tcctl ./install.sh ./start-tcctl.sh ./stop-tcctl.sh $(TARGET_DIR)
	@cp ./README.md ./LICENSE $(TARGET_DIR)
	@echo "Done."

clean:
	rm -rf $(TARGET_DIR) __pycache__
