package com.shortly.repository;

import java.util.List;
import com.shortly.dto.UrlClickCount;
import com.shortly.model.Click;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClickRepository extends JpaRepository<Click, Long> {

    List<Click> findByUrlId(Long urlId);

    long countByUrlId(Long urlId);

    @Query("SELECT c.url.id AS urlId, COUNT(c) AS clickCount FROM Click c WHERE c.url.id IN :urlIds GROUP BY c.url.id")
    List<UrlClickCount> countByUrlIdIn(@Param("urlIds") List<Long> urlIds);

    // Group by date → for time-series chart (last 30 days)
    @Query("SELECT CAST(c.clickedAt AS date), COUNT(c) " +
           "FROM Click c WHERE c.url.id = :urlId " +
           "GROUP BY CAST(c.clickedAt AS date) ORDER BY CAST(c.clickedAt AS date)")
    List<Object[]> countGroupByDate(@Param("urlId") Long urlId);

    // Group by country → for geographic breakdown
    @Query("SELECT c.country, COUNT(c) FROM Click c WHERE c.url.id = :urlId " +
           "GROUP BY c.country ORDER BY COUNT(c) DESC")
    List<Object[]> countGroupByCountry(@Param("urlId") Long urlId);

    // Group by device type → mobile / desktop / tablet
    @Query("SELECT c.deviceType, COUNT(c) FROM Click c WHERE c.url.id = :urlId " +
           "GROUP BY c.deviceType ORDER BY COUNT(c) DESC")
    List<Object[]> countGroupByDevice(@Param("urlId") Long urlId);

    // Group by browser → Chrome / Firefox / Safari / etc.
    @Query("SELECT c.browser, COUNT(c) FROM Click c WHERE c.url.id = :urlId " +
           "GROUP BY c.browser ORDER BY COUNT(c) DESC")
    List<Object[]> countGroupByBrowser(@Param("urlId") Long urlId);
}
