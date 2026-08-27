package com.kpip.platform.controller;

import com.kpip.platform.entity.BookingSlot;
import com.kpip.platform.repository.BookingSlotRepository;
import com.kpip.platform.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingSlotRepository bookingSlotRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public ResponseEntity<?> getBookings(@RequestHeader(value = "Authorization", required = false) String token) {
        String userId = jwtUtil.getUserIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        if (userId == null || role == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }

        List<BookingSlot> bookings;
        if ("FARMER".equals(role)) {
            bookings = bookingSlotRepository.findByFarmerId(userId);
        } else {
            bookings = bookingSlotRepository.findAll();
        }
        return ResponseEntity.ok(bookings);
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, Object> payload) {
        
        String farmerId = jwtUtil.getUserIdFromToken(token);
        if (farmerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }

        String centreId = (String) payload.get("centreId");
        String centreName = (String) payload.get("centreName");
        String date = (String) payload.get("date");
        String timeSlot = (String) payload.get("timeSlot");
        Double quantity = Double.valueOf(payload.get("quantity").toString());
        String crop = (String) payload.get("crop");
        String farmerName = (String) payload.get("farmerName");

        // Format Date to generate Booking ID (dd/mm/yy-timestamp)
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yy");
        String datePrefix = now.format(formatter);
        long unixTimestamp = System.currentTimeMillis() / 1000;
        String bookingId = datePrefix + "-" + unixTimestamp;

        // Daily sequential Token Number (#001, #002) for this centre + date
        long count = bookingSlotRepository.countByCentreIdAndDate(centreId, date);
        String tokenNumber = String.format("#%03d", count + 1);

        BookingSlot booking = new BookingSlot();
        booking.setId(bookingId);
        booking.setFarmerId(farmerId);
        booking.setFarmerName(farmerName);
        booking.setCentreId(centreId);
        booking.setCentreName(centreName);
        booking.setDate(date);
        booking.setTimeSlot(timeSlot);
        booking.setQuantityQuintals(quantity);
        booking.setCrop(crop);
        booking.setStatus("PENDING");
        booking.setTokenNumber(tokenNumber);
        
        bookingSlotRepository.save(booking);

        // Fetch AI Predictor estimated wait time from Python microservice
        int predictedWait = 25; // default fallback minutes
        String congestion = "OPTIMAL";
        String recommendation = "No surge volumes detected.";

        try {
            String url = "http://backend-python:8000/predict";
            Map<String, Object> request = new HashMap<>();
            request.put("centreId", centreId);
            request.put("crop", crop);
            request.put("quantity", quantity);
            request.put("timeSlot", timeSlot);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                predictedWait = (Integer) response.getBody().get("predictedWaitMinutes");
                congestion = (String) response.getBody().get("congestionLevel");
                recommendation = (String) response.getBody().get("recommendation");
            }
        } catch (Exception e) {
            // Log fallback when Python microservice is busy or building
            System.out.println("FastAPI AI engine offline. Falling back to default predictions.");
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("success", true);
        responseData.put("booking", booking);
        responseData.put("aiPrediction", Map.of(
            "predictedWaitMinutes", predictedWait,
            "congestionLevel", congestion,
            "recommendation", recommendation
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(responseData);
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable("bookingId") String bookingId,
            @RequestBody Map<String, String> payload) {
        
        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status field is required."));
        }

        Optional<BookingSlot> slotOpt = bookingSlotRepository.findById(bookingId);
        if (slotOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Booking slot not found."));
        }

        BookingSlot slot = slotOpt.get();
        slot.setStatus(newStatus.toUpperCase());
        bookingSlotRepository.save(slot);

        return ResponseEntity.ok(Map.of("success", true, "booking", slot));
    }
}
