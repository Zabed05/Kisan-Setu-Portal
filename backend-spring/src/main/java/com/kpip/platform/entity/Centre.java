package com.kpip.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "centres")
public class Centre {

    @Id
    private String id;

    private String name;
    private String state;
    private String district;
    private String village;

    @Column(name = "max_daily_capacity_quintals")
    private Double maxDailyCapacityQuintals;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public Double getMaxDailyCapacityQuintals() { return maxDailyCapacityQuintals; }
    public void setMaxDailyCapacityQuintals(Double maxDailyCapacityQuintals) { this.maxDailyCapacityQuintals = maxDailyCapacityQuintals; }
}
