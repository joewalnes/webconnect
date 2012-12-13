build: firebreath
	./firebreath/prepmake.sh plugins
	make -C firebreath/build
.PHONY:build

# Fetch firebreath submodule
firebreath: ../.gitmodules
	cd ../ && git submodule update --recursive --init

