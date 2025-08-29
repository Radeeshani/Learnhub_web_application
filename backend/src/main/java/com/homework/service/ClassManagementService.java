package com.homework.service;

import com.homework.entity.Class;
import com.homework.entity.Enrollment;
import com.homework.entity.User;
import com.homework.enums.UserRole;
import com.homework.repository.ClassRepository;
import com.homework.repository.EnrollmentRepository;
import com.homework.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClassManagementService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Create a new class
     */
    public Map<String, Object> createClass(Class classData) {
        // Validate teacher exists and is a teacher
        if (classData.getTeacher() != null) {
            User teacher = userRepository.findById(classData.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("User is not a teacher");
            }
        }

        // Generate class name if not provided (e.g., "Grade 1-A")
        if (classData.getClassName() == null || classData.getClassName().trim().isEmpty()) {
            String className = classData.getGradeLevel();
            if (classData.getSection() != null && !classData.getSection().trim().isEmpty()) {
                className += "-" + classData.getSection();
            }
            classData.setClassName(className);
        }

        classData.setCreatedAt(LocalDateTime.now());
        classData.setUpdatedAt(LocalDateTime.now());
        classData.setIsActive(true);

        Class savedClass = classRepository.save(classData);
        
        // Return a clean response map instead of the entity to avoid lazy loading serialization issues
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedClass.getId());
        response.put("className", savedClass.getClassName());
        response.put("subject", savedClass.getSubject());
        response.put("gradeLevel", savedClass.getGradeLevel());
        response.put("section", savedClass.getSection());
        response.put("capacity", savedClass.getCapacity());
        response.put("description", savedClass.getDescription());
        response.put("scheduleInfo", savedClass.getScheduleInfo());
        response.put("roomNumber", savedClass.getRoomNumber());
        response.put("academicYear", savedClass.getAcademicYear());
        response.put("semester", savedClass.getSemester());
        response.put("maxStudents", savedClass.getMaxStudents());
        response.put("isActive", savedClass.getIsActive());
        response.put("createdAt", savedClass.getCreatedAt());
        response.put("updatedAt", savedClass.getUpdatedAt());
        
        // Add teacher information if available
        if (savedClass.getTeacher() != null) {
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", savedClass.getTeacher().getId());
            teacherInfo.put("firstName", savedClass.getTeacher().getFirstName());
            teacherInfo.put("lastName", savedClass.getTeacher().getLastName());
            teacherInfo.put("email", savedClass.getTeacher().getEmail());
            response.put("teacher", teacherInfo);
        }
        
        return response;
    }

    /**
     * Update an existing class
     */
    public Map<String, Object> updateClass(Long classId, Class classData) {
        Class existingClass = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        // Update fields
        if (classData.getClassName() != null) {
            existingClass.setClassName(classData.getClassName());
        }
        if (classData.getSubject() != null) {
            existingClass.setSubject(classData.getSubject());
        }
        if (classData.getGradeLevel() != null) {
            existingClass.setGradeLevel(classData.getGradeLevel());
        }
        if (classData.getSection() != null) {
            existingClass.setSection(classData.getSection());
        }
        if (classData.getCapacity() != null) {
            existingClass.setCapacity(classData.getCapacity());
        }
        if (classData.getDescription() != null) {
            existingClass.setDescription(classData.getDescription());
        }
        if (classData.getScheduleInfo() != null) {
            existingClass.setScheduleInfo(classData.getScheduleInfo());
        }
        if (classData.getRoomNumber() != null) {
            existingClass.setRoomNumber(classData.getRoomNumber());
        }
        if (classData.getAcademicYear() != null) {
            existingClass.setAcademicYear(classData.getAcademicYear());
        }
        if (classData.getSemester() != null) {
            existingClass.setSemester(classData.getSemester());
        }
        if (classData.getMaxStudents() != null) {
            existingClass.setMaxStudents(classData.getMaxStudents());
        }
        if (classData.getIsActive() != null) {
            existingClass.setIsActive(classData.getIsActive());
        }

        // Update teacher if provided
        if (classData.getTeacher() != null) {
            User teacher = userRepository.findById(classData.getTeacher().getId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("User is not a teacher");
            }
            existingClass.setTeacher(teacher);
        }

        existingClass.setUpdatedAt(LocalDateTime.now());
        Class updatedClass = classRepository.save(existingClass);
        
        // Return a clean response map instead of the entity to avoid lazy loading serialization issues
        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedClass.getId());
        response.put("className", updatedClass.getClassName());
        response.put("subject", updatedClass.getSubject());
        response.put("gradeLevel", updatedClass.getGradeLevel());
        response.put("section", updatedClass.getSection());
        response.put("capacity", updatedClass.getCapacity());
        response.put("description", updatedClass.getDescription());
        response.put("scheduleInfo", updatedClass.getScheduleInfo());
        response.put("roomNumber", updatedClass.getRoomNumber());
        response.put("academicYear", updatedClass.getAcademicYear());
        response.put("semester", updatedClass.getSemester());
        response.put("maxStudents", updatedClass.getMaxStudents());
        response.put("isActive", updatedClass.getIsActive());
        response.put("createdAt", updatedClass.getCreatedAt());
        response.put("updatedAt", updatedClass.getUpdatedAt());
        
        // Add teacher information if available
        if (updatedClass.getTeacher() != null) {
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", updatedClass.getTeacher().getId());
            teacherInfo.put("firstName", updatedClass.getTeacher().getFirstName());
            teacherInfo.put("lastName", updatedClass.getTeacher().getLastName());
            teacherInfo.put("email", updatedClass.getTeacher().getEmail());
            response.put("teacher", teacherInfo);
        }
        
        return response;
    }

    /**
     * Remove teacher from class
     */
    public Map<String, Object> removeTeacherFromClass(Long classId) {
        try {
            System.out.println("Removing teacher from class " + classId);
            
            Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with ID: " + classId));

            if (classEntity.getTeacher() == null) {
                throw new RuntimeException("Class has no assigned teacher to remove");
            }

            System.out.println("Found class: " + classEntity.getClassName() + ", removing teacher: " + classEntity.getTeacher().getFirstName() + " " + classEntity.getTeacher().getLastName());
            
            // Remove the teacher by setting it to null
            classEntity.setTeacher(null);
            Class savedClass = classRepository.save(classEntity);
            
            System.out.println("Successfully removed teacher from class. Class ID: " + savedClass.getId());
            
            // Return a clean response map instead of the entity to avoid lazy loading serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedClass.getId());
            response.put("className", savedClass.getClassName());
            response.put("subject", savedClass.getSubject());
            response.put("gradeLevel", savedClass.getGradeLevel());
            response.put("section", savedClass.getSection());
            response.put("capacity", savedClass.getCapacity());
            response.put("description", savedClass.getDescription());
            response.put("scheduleInfo", savedClass.getScheduleInfo());
            response.put("roomNumber", savedClass.getRoomNumber());
            response.put("academicYear", savedClass.getAcademicYear());
            response.put("semester", savedClass.getSemester());
            response.put("maxStudents", savedClass.getMaxStudents());
            response.put("isActive", savedClass.getIsActive());
            response.put("createdAt", savedClass.getCreatedAt());
            response.put("updatedAt", savedClass.getUpdatedAt());
            
            // Teacher is now null, so we don't include teacher info
            response.put("teacher", null);
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Error removing teacher from class: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Assign teacher to class
     */
    public Map<String, Object> assignTeacherToClass(Long classId, Long teacherId) {
        try {
            System.out.println("Assigning teacher " + teacherId + " to class " + classId);
            
            Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with ID: " + classId));

            User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found with ID: " + teacherId));

            if (teacher.getRole() != UserRole.TEACHER) {
                throw new RuntimeException("User with ID " + teacherId + " is not a teacher. Role: " + teacher.getRole());
            }

            System.out.println("Found class: " + classEntity.getClassName() + ", Teacher: " + teacher.getFirstName() + " " + teacher.getLastName());
            
            // Set the teacher ID directly to avoid lazy loading issues
            classEntity.setTeacher(teacher);
            Class savedClass = classRepository.save(classEntity);
            
            // Verify the save was successful
            if (savedClass.getTeacher() == null || !savedClass.getTeacher().getId().equals(teacherId)) {
                throw new RuntimeException("Failed to save teacher assignment");
            }
            
            System.out.println("Successfully assigned teacher to class. Class ID: " + savedClass.getId());
            
            // Return a clean response map instead of the entity to avoid lazy loading serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedClass.getId());
            response.put("className", savedClass.getClassName());
            response.put("subject", savedClass.getSubject());
            response.put("gradeLevel", savedClass.getGradeLevel());
            response.put("section", savedClass.getSection());
            response.put("capacity", savedClass.getCapacity());
            response.put("description", savedClass.getDescription());
            response.put("scheduleInfo", savedClass.getScheduleInfo());
            response.put("roomNumber", savedClass.getRoomNumber());
            response.put("academicYear", savedClass.getAcademicYear());
            response.put("semester", savedClass.getSemester());
            response.put("maxStudents", savedClass.getMaxStudents());
            response.put("isActive", savedClass.getIsActive());
            response.put("createdAt", savedClass.getCreatedAt());
            response.put("updatedAt", savedClass.getUpdatedAt());
            
            // Add teacher information
            if (savedClass.getTeacher() != null) {
                Map<String, Object> teacherInfo = new HashMap<>();
                teacherInfo.put("id", savedClass.getTeacher().getId());
                teacherInfo.put("firstName", savedClass.getTeacher().getFirstName());
                teacherInfo.put("lastName", savedClass.getTeacher().getLastName());
                teacherInfo.put("email", savedClass.getTeacher().getEmail());
                response.put("teacher", teacherInfo);
            }
            
            return response;
            
        } catch (Exception e) {
            System.err.println("Error assigning teacher to class: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Enroll student in class
     */
    public Enrollment enrollStudentInClass(Long classId, Long studentId) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        // Check if class is active
        if (!classEntity.getIsActive()) {
            throw new RuntimeException("Cannot enroll in inactive class");
        }

        // Check if student is already enrolled
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentIdAndClassEntityId(studentId, classId);
        if (existingEnrollment.isPresent()) {
            Enrollment existing = existingEnrollment.get();
            if (existing.getStatus() == Enrollment.EnrollmentStatus.ACTIVE) {
                throw new RuntimeException("Student is already enrolled in this class");
            } else {
                // Reactivate inactive enrollment
                existing.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
                existing.setUpdatedAt(LocalDateTime.now());
                return enrollmentRepository.save(existing);
            }
        }

        // Check class capacity
        if (classEntity.getCapacity() != null) {
            long currentEnrollments = enrollmentRepository.countByClassEntityIdAndStatus(classId, Enrollment.EnrollmentStatus.ACTIVE);
            if (currentEnrollments >= classEntity.getCapacity()) {
                throw new RuntimeException("Class is at maximum capacity");
            }
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassEntity(classEntity);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);

        return enrollmentRepository.save(enrollment);
    }

    /**
     * Enroll multiple students in class
     */
    public List<Enrollment> enrollMultipleStudentsInClass(Long classId, List<Long> studentIds) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!classEntity.getIsActive()) {
            throw new RuntimeException("Cannot enroll in inactive class");
        }

        // Check class capacity
        if (classEntity.getCapacity() != null) {
            long currentEnrollments = enrollmentRepository.countByClassEntityIdAndStatus(classId, Enrollment.EnrollmentStatus.ACTIVE);
            if (currentEnrollments + studentIds.size() > classEntity.getCapacity()) {
                throw new RuntimeException("Enrolling these students would exceed class capacity. Current: " + currentEnrollments + ", Adding: " + studentIds.size() + ", Capacity: " + classEntity.getCapacity());
            }
        }

        List<Enrollment> enrollments = new ArrayList<>();
        
        for (Long studentId : studentIds) {
            User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

            if (student.getRole() != UserRole.STUDENT) {
                throw new RuntimeException("User with ID " + studentId + " is not a student");
            }

            // Check if student already has an enrollment (active or inactive)
            Optional<Enrollment> existingEnrollment = enrollmentRepository.findByStudentIdAndClassEntityId(studentId, classId);
            
            if (existingEnrollment.isPresent()) {
                Enrollment enrollment = existingEnrollment.get();
                if (enrollment.getStatus() == Enrollment.EnrollmentStatus.ACTIVE) {
                    throw new RuntimeException("Student " + student.getFirstName() + " " + student.getLastName() + " is already actively enrolled in this class");
                } else {
                    // Reactivate inactive enrollment
                    enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);
                    enrollment.setUpdatedAt(LocalDateTime.now());
                    enrollments.add(enrollmentRepository.save(enrollment));
                    continue;
                }
            }

            // Create new enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setClassEntity(classEntity);
            enrollment.setEnrollmentDate(LocalDateTime.now());
            enrollment.setStatus(Enrollment.EnrollmentStatus.ACTIVE);

            enrollments.add(enrollmentRepository.save(enrollment));
        }

        return enrollments;
    }

    /**
     * Remove student from class
     */
    public void removeStudentFromClass(Long classId, Long studentId) {
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndClassEntityId(studentId, classId)
            .orElseThrow(() -> new RuntimeException("Student is not enrolled in this class"));

        enrollment.setStatus(Enrollment.EnrollmentStatus.INACTIVE);
        enrollment.setUpdatedAt(LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    /**
     * Get all classes with detailed information
     */
    public List<Map<String, Object>> getAllClassesWithDetails() {
        List<Class> classes = classRepository.findAll();
        return classes.stream().map(cls -> {
            Map<String, Object> classInfo = new HashMap<>();
            classInfo.put("id", cls.getId());
            classInfo.put("className", cls.getClassName());
            classInfo.put("subject", cls.getSubject());
            classInfo.put("gradeLevel", cls.getGradeLevel());
            classInfo.put("section", cls.getSection());
            classInfo.put("capacity", cls.getCapacity());
            classInfo.put("description", cls.getDescription());
            classInfo.put("scheduleInfo", cls.getScheduleInfo());
            classInfo.put("roomNumber", cls.getRoomNumber());
            classInfo.put("academicYear", cls.getAcademicYear());
            classInfo.put("semester", cls.getSemester());
            classInfo.put("maxStudents", cls.getMaxStudents());
            classInfo.put("isActive", cls.getIsActive());
            classInfo.put("createdAt", cls.getCreatedAt());
            classInfo.put("updatedAt", cls.getUpdatedAt());

            // Teacher information
            if (cls.getTeacher() != null) {
                Map<String, Object> teacherInfo = new HashMap<>();
                teacherInfo.put("id", cls.getTeacher().getId());
                teacherInfo.put("firstName", cls.getTeacher().getFirstName());
                teacherInfo.put("lastName", cls.getTeacher().getLastName());
                teacherInfo.put("email", cls.getTeacher().getEmail());
                classInfo.put("teacher", teacherInfo);
            }

            // Current student count
            long currentStudentCount = enrollmentRepository.countByClassEntityIdAndStatus(cls.getId(), Enrollment.EnrollmentStatus.ACTIVE);
            classInfo.put("currentStudentCount", currentStudentCount);

            // Enrolled students information
            List<Enrollment> activeEnrollments = enrollmentRepository.findByClassEntityIdAndStatus(cls.getId(), Enrollment.EnrollmentStatus.ACTIVE);
            List<Map<String, Object>> enrolledStudents = activeEnrollments.stream().map(enrollment -> {
                Map<String, Object> studentInfo = new HashMap<>();
                studentInfo.put("id", enrollment.getStudent().getId());
                studentInfo.put("firstName", enrollment.getStudent().getFirstName());
                studentInfo.put("lastName", enrollment.getStudent().getLastName());
                studentInfo.put("email", enrollment.getStudent().getEmail());
                studentInfo.put("enrollmentDate", enrollment.getEnrollmentDate());
                studentInfo.put("enrollmentId", enrollment.getId());
                return studentInfo;
            }).collect(Collectors.toList());
            classInfo.put("enrolledStudents", enrolledStudents);

            // Available spots
            if (cls.getCapacity() != null) {
                classInfo.put("availableSpots", Math.max(0, cls.getCapacity() - currentStudentCount));
            }

            return classInfo;
        }).collect(Collectors.toList());
    }

    /**
     * Get class by ID with detailed information
     */
    public Map<String, Object> getClassWithDetails(Long classId) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        Map<String, Object> classInfo = new HashMap<>();
        classInfo.put("id", classEntity.getId());
        classInfo.put("className", classEntity.getClassName());
        classInfo.put("subject", classEntity.getSubject());
        classInfo.put("gradeLevel", classEntity.getGradeLevel());
        classInfo.put("section", classEntity.getSection());
        classInfo.put("capacity", classEntity.getCapacity());
        classInfo.put("description", classEntity.getDescription());
        classInfo.put("scheduleInfo", classEntity.getScheduleInfo());
        classInfo.put("roomNumber", classEntity.getRoomNumber());
        classInfo.put("academicYear", classEntity.getAcademicYear());
        classInfo.put("semester", classEntity.getSemester());
        classInfo.put("maxStudents", classEntity.getMaxStudents());
        classInfo.put("isActive", classEntity.getIsActive());
        classInfo.put("createdAt", classEntity.getCreatedAt());
        classInfo.put("updatedAt", classEntity.getUpdatedAt());

        // Teacher information
        if (classEntity.getTeacher() != null) {
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", classEntity.getTeacher().getId());
            teacherInfo.put("firstName", classEntity.getTeacher().getFirstName());
            teacherInfo.put("lastName", classEntity.getTeacher().getLastName());
            teacherInfo.put("email", classEntity.getTeacher().getEmail());
            classInfo.put("teacher", teacherInfo);
        }

        // Enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, Enrollment.EnrollmentStatus.ACTIVE);
        List<Map<String, Object>> students = enrollments.stream().map(enrollment -> {
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", enrollment.getStudent().getId());
            studentInfo.put("firstName", enrollment.getStudent().getFirstName());
            studentInfo.put("lastName", enrollment.getStudent().getLastName());
            studentInfo.put("email", enrollment.getStudent().getEmail());
            studentInfo.put("enrollmentDate", enrollment.getEnrollmentDate());
            studentInfo.put("enrollmentId", enrollment.getId());
            return studentInfo;
        }).collect(Collectors.toList());

        classInfo.put("enrolledStudents", students);
        classInfo.put("currentStudentCount", students.size());

        // Available spots
        if (classEntity.getCapacity() != null) {
            classInfo.put("availableSpots", Math.max(0, classEntity.getCapacity() - students.size()));
        }

        return classInfo;
    }

    /**
     * Get classes by grade level
     */
    public List<Map<String, Object>> getClassesByGradeLevel(String gradeLevel) {
        List<Class> classes = classRepository.findByGradeLevelAndIsActiveTrue(gradeLevel);
        return classes.stream().map(cls -> {
            Map<String, Object> classInfo = new HashMap<>();
            classInfo.put("id", cls.getId());
            classInfo.put("className", cls.getClassName());
            classInfo.put("subject", cls.getSubject());
            classInfo.put("section", cls.getSection());
            classInfo.put("capacity", cls.getCapacity());
            classInfo.put("currentStudentCount", enrollmentRepository.countByClassEntityIdAndStatus(cls.getId(), Enrollment.EnrollmentStatus.ACTIVE));
            return classInfo;
        }).collect(Collectors.toList());
    }

    /**
     * Get available teachers for assignment
     */
    public List<Map<String, Object>> getAvailableTeachers() {
        List<User> teachers = userRepository.findByRole(UserRole.TEACHER);
        return teachers.stream().map(teacher -> {
            Map<String, Object> teacherInfo = new HashMap<>();
            teacherInfo.put("id", teacher.getId());
            teacherInfo.put("firstName", teacher.getFirstName());
            teacherInfo.put("lastName", teacher.getLastName());
            teacherInfo.put("email", teacher.getEmail());
            teacherInfo.put("subjectTaught", teacher.getSubjectTaught());
            
            // Count classes they're currently teaching
            long classCount = classRepository.countByTeacherIdAndIsActiveTrue(teacher.getId());
            teacherInfo.put("currentClasses", classCount);
            
            return teacherInfo;
        }).collect(Collectors.toList());
    }

    /**
     * Get available students for enrollment
     */
    public List<Map<String, Object>> getAvailableStudents(String gradeLevel) {
        List<User> students = userRepository.findByRoleAndClassGrade(UserRole.STUDENT, gradeLevel);
        return students.stream().map(student -> {
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", student.getId());
            studentInfo.put("firstName", student.getFirstName());
            studentInfo.put("lastName", student.getLastName());
            studentInfo.put("email", student.getEmail());
            studentInfo.put("classGrade", student.getClassGrade());
            
            // Count current enrollments
            long enrollmentCount = enrollmentRepository.countByStudentIdAndStatus(student.getId(), Enrollment.EnrollmentStatus.ACTIVE);
            studentInfo.put("currentEnrollments", enrollmentCount);
            
            return studentInfo;
        }).collect(Collectors.toList());
    }

    /**
     * Deactivate class
     */
    public Class deactivateClass(Long classId) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        classEntity.setIsActive(false);
        classEntity.setUpdatedAt(LocalDateTime.now());
        return classRepository.save(classEntity);
    }

    /**
     * Activate class
     */
    public Class activateClass(Long classId) {
        Class classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        classEntity.setIsActive(true);
        classEntity.setUpdatedAt(LocalDateTime.now());
        return classRepository.save(classEntity);
    }

    /**
     * Get all available students for enrollment
     */
    public List<Map<String, Object>> getAllAvailableStudents() {
        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        return students.stream().map(student -> {
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", student.getId());
            studentInfo.put("firstName", student.getFirstName());
            studentInfo.put("lastName", student.getLastName());
            studentInfo.put("email", student.getEmail());
            studentInfo.put("classGrade", student.getClassGrade());
            
            // Count current enrollments
            long enrollmentCount = enrollmentRepository.countByStudentIdAndStatus(student.getId(), Enrollment.EnrollmentStatus.ACTIVE);
            studentInfo.put("currentEnrollments", enrollmentCount);
            
            return studentInfo;
        }).collect(Collectors.toList());
    }

    /**
     * Get enrolled students for a specific class
     */
    public List<Map<String, Object>> getEnrolledStudentsForClass(Long classId) {
        List<Enrollment> enrollments = enrollmentRepository.findByClassEntityIdAndStatus(classId, Enrollment.EnrollmentStatus.ACTIVE);
        return enrollments.stream().map(enrollment -> {
            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("id", enrollment.getStudent().getId());
            studentInfo.put("firstName", enrollment.getStudent().getFirstName());
            studentInfo.put("lastName", enrollment.getStudent().getLastName());
            studentInfo.put("email", enrollment.getStudent().getEmail());
            studentInfo.put("enrollmentDate", enrollment.getEnrollmentDate());
            studentInfo.put("enrollmentId", enrollment.getId());
            return studentInfo;
        }).collect(Collectors.toList());
    }
}
