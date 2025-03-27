#!/bin/bash

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Function to display usage
show_usage() {
    cat << EOF
Usage: ./build.sh [platform]
Available platforms:
  arm64    - Build for Apple Silicon (ARM64)
  amd64    - Build for x86_64/AMD64
  all      - Build for both platforms
  auto     - Automatically detect platform and build (default)
  push     - Push multi-arch images to Docker Hub
EOF
    exit 1
}

# Function to detect platform
detect_platform() {
    local arch=$(uname -m)
    case $arch in
        "arm64")  echo "arm64" ;;
        "aarch64") echo "arm64" ;;
        "x86_64") echo "amd64" ;;
        *) 
            log "Error: Unsupported architecture $arch"
            exit 1
            ;;
    esac
}

# Function to build for a specific platform
build_for_platform() {
    local platform=$1
    log "Building for $platform..."
    
    # Use buildx with the Dockerfile
    docker buildx build \
        --platform linux/$platform \
        --tag nguyenvulong/nextchat-slim:$platform \
        --load \
        .
    
    log "Build completed for $platform"
}

# Function to push multi-arch images
push_multi_arch() {
    log "Pushing multi-arch images..."
    
    # Build and push with automatic cleanup of builder containers
    docker buildx build \
        --platform linux/arm64,linux/amd64 \
        --tag nguyenvulong/nextchat-slim:latest \
        --push \
        --rm \
        .
    
    log "Multi-arch image pushed successfully"
}

# Validate Docker buildx availability
validate_buildx() {
    if ! docker buildx version &> /dev/null; then
        log "Error: Docker buildx is not available. Please install or enable buildx."
        exit 1
    fi
}

# Main script
main() {
    # Default to auto if no argument provided
    local platform=${1:-"auto"}
    
    # Validate buildx
    validate_buildx
    
    case $platform in
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
            local detected_platform=$(detect_platform)
            build_for_platform "$detected_platform"
            ;;
        "push")
            push_multi_arch
            ;;
        *)
            show_usage
            ;;
    esac
}

# Execute main function
main "$@"