# Stage 1: Build the jar using the project's Maven Wrapper and Java 25
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Maven wrapper files and configuration
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source code and build
COPY src src
RUN ./mvnw package -DskipTests

# Stage 2: Run the application on a lightweight Java 25 JRE runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]