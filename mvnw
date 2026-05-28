#!/usr/bin/env sh
# Lightweight Maven launcher: downloads a Maven binary locally and runs it.
# This is a minimal alternative to the official maven-wrapper to avoid
# requiring a system Maven installation.

set -eu

MAVEN_VERSION="3.9.6"
MAVEN_BASE_DIR=".mvn/apache-maven-${MAVEN_VERSION}"
MAVEN_BIN="$MAVEN_BASE_DIR/bin/mvn"

download_maven() {
  echo "Maven not found. Downloading Apache Maven ${MAVEN_VERSION}..."
  mkdir -p "$MAVEN_BASE_DIR"
  TMP_ARCHIVE="/tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
  URLS=(
    "https://downloads.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
    "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
  )

  for url in "${URLS[@]}"; do
    echo "Trying $url"
    if command -v curl >/dev/null 2>&1; then
      if curl -fSL "$url" -o "$TMP_ARCHIVE"; then
        break
      fi
    elif command -v wget >/dev/null 2>&1; then
      if wget -q -O "$TMP_ARCHIVE" "$url"; then
        break
      fi
    else
      echo "Please install curl or wget to allow the wrapper to download Maven." >&2
      exit 2
    fi
  done

  if [ ! -f "$TMP_ARCHIVE" ]; then
    echo "Failed to download Maven archive." >&2
    exit 2
  fi

  tar -xzf "$TMP_ARCHIVE" -C ".mvn"
  rm -f "$TMP_ARCHIVE"
  # Find the mvn executable inside .mvn (handles archives that create
  # .mvn/apache-maven-<version> or those extracted directly into .mvn)
  FOUND_MVN=$(find .mvn -type f -name mvn -print -quit 2>/dev/null || true)
  if [ -n "$FOUND_MVN" ]; then
    MAVEN_BIN="$FOUND_MVN"
  else
    # fallback to expected path
    MAVEN_BIN="$MAVEN_BASE_DIR/bin/mvn"
  fi
  if [ ! -x "$MAVEN_BIN" ]; then
    chmod +x "$MAVEN_BIN" || true
  fi
}

if [ ! -x "$MAVEN_BIN" ]; then
  download_maven
fi

exec "$MAVEN_BIN" "$@"
