
TARGET_DIR = ./target

build:
	@echo "Building..."
	@rm -rf $(TARGET_DIR)
	@mkdir -p $(TARGET_DIR)
	@cd ./webui && npm run build
	@cp -r ./webui/dist $(TARGET_DIR)/dist
	@cp ./run_prod.sh ./server.py ./tcctl.py $(TARGET_DIR)
	@echo "Done."

clean:
	rm -rf $(TARGET_DIR) __pycache__

