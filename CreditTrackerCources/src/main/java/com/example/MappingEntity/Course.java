package com.example.MappingEntity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Course {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
    private String courseName;
    private String courseCode;
    private int credits;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getCourseName() {
		return courseName;
	}
	public void setCourseName(String courseName) {
		this.courseName = courseName;
	}
	public String getCourseCode() {
		return courseCode;
	}
	public void setCourseCode(String courseCode) {
		this.courseCode = courseCode;
	}
	public int getCredits() {
		return credits;
	}
	public void setCredits(int credits) {
		this.credits = credits;
	}
	public Course(Long id, String courseName, String courseCode, int credits) {
		super();
		this.id = id;
		this.courseName = courseName;
		this.courseCode = courseCode;
		this.credits = credits;
	}
	public Course() {
		super();
		// TODO Auto-generated constructor stub
	}
	@Override
	public String toString() {
		return "Cource [id=" + id + ", courseName=" + courseName + ", courseCode=" + courseCode + ", credits=" + credits
				+ "]";
	}

	public Course findAll() {
		// TODO Auto-generated method stub
		return null;
	}
	public static Object findById(Long id2) {
		// TODO Auto-generated method stub
		return null;
	}

}
