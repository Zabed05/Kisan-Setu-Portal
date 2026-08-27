package com.kpip.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class BookingSlot {

    @Id
    private String id; // format: dd/mm/yy-timestamp

    @Column(name = "farmer_id", nullable = false)
    private String farmerId;

    @Column(name = "farmer_name")
    private String farmerName;

    @Column(name = "centre_id", nullable = false)
    private String centreId;

    @Column(name = "centre_name")
    private String centreName;

    private String date; // format: YYYY-MM-DD
    
    @Column(name = "time_slot")
    private String timeSlot;

    @Column(name = "quantity_quintals")
    private Double quantityQuintals;

    private String crop;
    private String status; // PENDING, APPROVED, WEIGHED, COMPLETED, CANCELLED

    @Column(name = "token_number")
    private String tokenNumber; // sequential serial e.g. #001

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public String getCentreId() { return centreId; }
    public void setCentreId(String centreId) { this.centreId = centreId; }

    public String getCentreName() { return centreName; }
    public void setCentreName(String centreName) { this.centreName = centreName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public Double getQuantityQuintals() { return quantityQuintals; }
    public void setQuantityQuintals(Double quantityQuintals) { this.quantityQuintals = quantityQuintals; }

    public String getCrop() { return crop; }
    public void setCrop(String crop) { this.crop = crop; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
