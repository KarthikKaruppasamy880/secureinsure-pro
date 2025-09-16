# Multi-stage build for Admin Service
FROM maven:3.9.5 AS build

WORKDIR /app

# Copy parent pom.xml
COPY pom.xml ./

# Copy all module pom.xml files
COPY gateway-service/pom.xml ./gateway-service/
COPY auth-service/pom.xml ./auth-service/
COPY policy-service/pom.xml ./policy-service/
COPY claims-service/pom.xml ./claims-service/
COPY notification-service/pom.xml ./notification-service/
COPY admin-service/pom.xml ./admin-service/
COPY search-service/pom.xml ./search-service/

# Download dependencies (disable SSL for Docker build)
RUN mvn dependency:go-offline -B -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true -Dmaven.wagon.http.ssl.ignore.validity.dates=true

# Copy source code
COPY admin-service/src ./admin-service/src

# Build the application (disable SSL for Docker build)
RUN mvn clean package -pl admin-service -am -DskipTests -Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true -Dmaven.wagon.http.ssl.ignore.validity.dates=true

# Runtime stage
FROM eclipse-temurin:17-jdk

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/admin-service/target/admin-service-*.jar app.jar

# Change ownership to app user
RUN chown appuser:appuser app.jar

# Switch to app user
USER appuser

# Expose port
EXPOSE 8085

# Health check disabled for now

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 