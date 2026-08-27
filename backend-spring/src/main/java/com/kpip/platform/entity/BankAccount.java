package com.kpip.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_accounts")
public class BankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", unique = true, nullable = false)
    private String farmerId;

    @Column(name = "account_holder")
    private String accountHolder;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number_encrypted")
    private String accountNumberEncrypted;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "is_verified")
    private Boolean isVerified = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFarmerId() { return farmerId; }
    public void setFarmerId(String farmerId) { this.farmerId = farmerId; }

    public String getAccountHolder() { return accountHolder; }
    public void setAccountHolder(String accountHolder) { this.accountHolder = accountHolder; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public String getAccountNumberEncrypted() { return accountNumberEncrypted; }
    public void setAccountNumberEncrypted(String accountNumberEncrypted) { this.accountNumberEncrypted = accountNumberEncrypted; }

    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
