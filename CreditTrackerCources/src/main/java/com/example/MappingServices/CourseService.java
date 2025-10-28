package com.example.MappingServices;

import com.example.MappingEntity.Course;

public interface CourseService {
    String getAllCourses();
    Course saveCourse(Course course);
    Course getCourseById(Long id);
    void deleteCourse(Long id);
    Course updateCourse(Long id, Course courseDetails); // New method for update
}