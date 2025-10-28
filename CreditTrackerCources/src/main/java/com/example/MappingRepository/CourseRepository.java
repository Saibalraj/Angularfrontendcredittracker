package com.example.MappingRepository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.MappingEntity.Course;

// Extends JpaRepository to get basic CRUD operations for free

public interface CourseRepository extends JpaRepository<Course,Long> {

}
