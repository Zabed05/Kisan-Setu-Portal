package com.kpip.platform.repository;

import com.kpip.platform.entity.BookingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingSlotRepository extends JpaRepository<BookingSlot, String> {
    List<BookingSlot> findByFarmerId(String farmerId);
    List<BookingSlot> findByCentreId(String centreId);
    long countByCentreIdAndDate(String centreId, String date);
}
