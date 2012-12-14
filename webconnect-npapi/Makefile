# Detect platform
# TODO: Windows
UNAME:=$(shell uname -s)
ifeq ($(UNAME),Darwin)
LINUX=
OSX=1
WINDOWS=
else ifeq ($(UNAME),Linux)
LINUX=1
OSX=
WINDOWS=
else
$(error Unsupported platform: $(UNAME))
endif

build: firebreath
ifdef LINUX
	./firebreath/prepmake.sh plugins
	make -C firebreath/build
else ifdef OSX
	./firebreath/prepmac.sh plugins
	(cd firebreath/build/ && xcodebuild )
endif
.PHONY: build

install:
#	ln -sf $(CURDIR)/firebreath/build/projects/*/*.plugin "/Library/Internet Plug-Ins/"
.PHONY: install

# Fetch firebreath submodule
firebreath: ../.gitmodules
	cd ../ && git submodule update --recursive --init
