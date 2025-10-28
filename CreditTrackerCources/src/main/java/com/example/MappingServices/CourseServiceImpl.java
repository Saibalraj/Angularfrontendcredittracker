package com.example.MappingServices;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MappingEntity.Course;
import com.example.MappingRepository.CourseRepository;

@Service
public class CourseServiceImpl implements CourseService {
	@Autowired
	private CourseRepository courseRepository;

	@Override
	public String getAllCourses() {
		// TODO Auto-generated method stub
		return "Course Created in database successfully";
	}

	@Override
	public Course saveCourse(Course course) {
		// TODO Auto-generated method stub
		return course.findAll();
	}

	@Override
	public Course getCourseById(Long id) {
		// TODO Auto-generated method stub
		return null ;
	}

	@Override
	public void deleteCourse(Long id) {
		// TODO Auto-generated method stub
		 courseRepository.deleteById(id);
	}

	@Override
	public Course updateCourse(Long id, Course courseDetails) {
		// TODO Auto-generated method stub
		 Course course = getCourseById(id); // Reuses the find-by-id logic
		// Update fields
		 	        course.setCourseName(courseDetails.getCourseName());
		 	        course.setCourseCode(courseDetails.getCourseCode());
		 	        course.setCredits(courseDetails.getCredits());
		 	        return courseRepository.save(course);
		 	    }

//	@Override
//	 public List<Course> getAllCourses() {
//	        return courseRepository.findAll();
//	}
//	@Override
//	public com.example.MappingEntity.Course getCourseById(Long id) {
//        return courseRepository.findById(id)
//               .orElseThrow(() -> new RuntimeException("Course not found for id :: " + id));
//}
//	@Override
//	public void deleteCourse(Long id) {
//        courseRepository.deleteById(id);
//    }
//	 
//	    public Course updateCourse(Long id, Course courseDetails) {
//	        Course course = getCourseById(id); // Reuses the find-by-id logic
//
//	        // Update fields
//	        course.setCourseName(courseDetails.getCourseName());
//	        course.setCourseCode(courseDetails.getCourseCode());
//	        course.setCredits(courseDetails.getCredits());
//
//	        return courseRepository.save(course);
//	    
//}
}