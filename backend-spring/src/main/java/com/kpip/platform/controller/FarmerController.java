package com.kpip.platform.controller;

import com.kpip.platform.entity.BankAccount;
import com.kpip.platform.entity.Farmer;
import com.kpip.platform.repository.BankAccountRepository;
import com.kpip.platform.repository.FarmerRepository;
import com.kpip.platform.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/farmers")
public class FarmerController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        String farmerId = jwtUtil.getUserIdFromToken(token);
        if (farmerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }

        Optional<Farmer> farmerOpt = farmerRepository.findById(farmerId);
        if (farmerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Farmer profile not found."));
        }

        Farmer farmer = farmerOpt.get();
        Optional<BankAccount> bankOpt = bankAccountRepository.findByFarmerId(farmerId);

        Map<String, Object> response = new HashMap<>();
        response.put("id", farmer.getId());
        response.put("phone", farmer.getPhone());
        response.put("name", farmer.getName());
        response.put("state", farmer.getState());
        response.put("district", farmer.getDistrict());
        response.put("village", farmer.getVillage());
        response.put("pincode", farmer.getPincode());
        response.put("latitude", farmer.getLatitude());
        response.put("longitude", farmer.getLongitude());
        response.put("isVerified", farmer.getIsVerified());
        
        if (bankOpt.isPresent()) {
            BankAccount bank = bankOpt.get();
            Map<String, Object> bankDetails = new HashMap<>();
            bankDetails.put("accountHolder", bank.getAccountHolder());
            bankDetails.put("bankName", bank.getBankName());
            bankDetails.put("accountNumber", bank.getAccountNumberEncrypted());
            bankDetails.put("ifscCode", bank.getIfscCode());
            bankDetails.put("isVerified", bank.getIsVerified());
            bankDetails.put("linkedDate", bank.getCreatedAt().toString());
            response.put("bankAccount", bankDetails);
        } else {
            response.put("bankAccount", null);
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> payload) {
        
        String farmerId = jwtUtil.getUserIdFromToken(token);
        if (farmerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized access."));
        }

        Optional<Farmer> farmerOpt = farmerRepository.findById(farmerId);
        Farmer farmer = farmerOpt.orElseGet(() -> {
            Farmer newFarmer = new Farmer();
            newFarmer.setId(farmerId);
            return newFarmer;
        });

        // Set location and profile details
        farmer.setName(payload.get("fullName"));
        farmer.setState(payload.get("state"));
        farmer.setDistrict(payload.get("district"));
        farmer.setVillage(payload.get("village"));
        farmer.setPincode(payload.get("pincode"));
        farmer.setIsVerified(true);
        farmerRepository.save(farmer);

        // Set bank details
        Optional<BankAccount> bankOpt = bankAccountRepository.findByFarmerId(farmerId);
        BankAccount bank = bankOpt.orElseGet(() -> {
            BankAccount newBank = new BankAccount();
            newBank.setFarmerId(farmerId);
            return newBank;
        });

        bank.setAccountHolder(payload.get("fullName"));
        bank.setBankName(payload.get("bankName"));
        bank.setAccountNumberEncrypted(payload.get("accountNumber"));
        bank.setIfscCode(payload.get("ifsc"));
        bankAccountRepository.save(bank);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("farmer", farmer);
        response.put("bankAccount", bank);

        return ResponseEntity.ok(response);
    }
}
