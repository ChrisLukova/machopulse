package com.machopulse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class MachopulseBackendApplication {

	static void main(String[] args) {
		SpringApplication.run(MachopulseBackendApplication.class, args);
	}

}
