package com.shortly.repository;

import java.util.List;
import com.shortly.model.Click;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClickRepository extends JpaRepository<Click, Long> {
    List<Click> findByUrlId(Long urlId);
    long countByUrlId(Long urlId);
}
