#!/bin/bash

# Function to display usage
show_usage() {
    echo "Usage: ./build.sh [platform]"
    echo "Available platforms:"
    echo "  arm64    - Build for Apple Silicon (ARM64)"
    echo "  amd64    - Build for x86_64/AMD64"
    echo "  all      - Build for both platforms"
    echo "  auto     - Automatically detect platform and build (default)"
    echo "  push     - Push multi-arch images to Docker Hub"
    exit 1
}

# Function to detect platform
detect_platform() {
    if [[ $(uname -m) == "arm64" ]]; then
        echo "arm64"
    elif [[ $(uname -m) == "x86_64" ]]; then
        echo "amd64"
    else
        echo "unknown"
    fi
}

# Function to build for a specific platform
build_for_platform() {
    local platform=$1
    echo "Building for $platform..."
    
    # Update docker-compose file with the correct platform
    sed -i '' "s/platform: linux\/.*/platform: linux\/$platform/" docker-compose.yml
    
    # Build using docker-compose with platform and build variables
    PLATFORM=$platform \
    BUILDPLATFORM=linux/$platform \
    TARGETPLATFORM=linux/$platform \
    docker-compose -f docker-compose.yml build
    
    # Tag the image with platform-specific tag
    docker tag nguyenvulong/nextchat-slim:latest nguyenvulong/nextchat-slim:${platform}
    
    echo "Build completed for $platform"
}

# Function to push multi-arch images
push_multi_arch() {
    echo "Pushing platform-specific images..."
    
    # Push individual platform images first
    docker push nguyenvulong/nextchat-slim:arm64
    docker push nguyenvulong/nextchat-slim:amd64
    
    echo "Creating and pushing multi-arch manifest..."
    
    # Create a new manifest
    docker manifest create nguyenvulong/nextchat-slim:latest \
        nguyenvulong/nextchat-slim:arm64 \
        nguyenvulong/nextchat-slim:amd64
    
    # Push the manifest
    docker manifest push nguyenvulong/nextchat-slim:latest
}

# Main script
if [ $# -eq 0 ]; then
    PLATFORM="auto"
else
    PLATFORM=$1
fi

case $PLATFORM in
    "arm64")
        build_for_platform "arm64"
        ;;
    "amd64")
        build_for_platform "amd64"
        ;;
    "all")
        build_for_platform "arm64"
        build_for_platform "amd64"
        push_multi_arch
        ;;
    "auto")
        DETECTED_PLATFORM=$(detect_platform)
        if [ "$DETECTED_PLATFORM" == "unknown" ]; then
            echo "Error: Could not detect platform"
            show_usage
        else
            build_for_platform "$DETECTED_PLATFORM"
        fi
        ;;
    "push")
        push_multi_arch
        ;;
    *)
        show_usage
        ;;
esac 