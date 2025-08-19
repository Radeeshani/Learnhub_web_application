package com.homework.repository;

import com.homework.entity.Homework;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, Long> {
    List<Homework> findByTeacherId(Long teacherId);
    List<Homework> findByClassGrade(String classGrade, Sort sort);
    List<Homework> findByClassGradeAndSubject(String classGrade, String subject, Sort sort);
    List<Homework> findByDueDateAfter(LocalDateTime date);
} 