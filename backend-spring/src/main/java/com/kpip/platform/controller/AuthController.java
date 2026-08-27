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
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/farmer/login")
    public ResponseEntity<?> sendFarmerOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.get("mobileNumber");
        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile number is required."));
        }
        
        // Emulate sending OTP SMS
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "OTP sent successfully to " + phone + ". Sandbox code is 123456"
        ));
    }

    @PostMapping("/farmer/verify-otp")
    public ResponseEntity<?> verifyFarmerOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.get("mobileNumber");
        String otp = payload.get("otp");

        if (phone == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile number and OTP are required."));
        }

        // OTP Sandbox bypass code verification
        if (!"123456".equals(otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid verification code."));
        }

        // Fetch or create farmer profile
        Optional<Farmer> farmerOpt = farmerRepository.findByPhone(phone);
        Farmer farmer;
        boolean profileCompleted = false;

        if (farmerOpt.isPresent()) {
            farmer = farmerOpt.get();
            Optional<BankAccount> bankOpt = bankAccountRepository.findByFarmerId(farmer.getId());
            if (bankOpt.isPresent() && farmer.getName() != null && !farmer.getName().isEmpty() && !"New Farmer User".equals(farmer.getName())) {
                profileCompleted = true;
            }
        } else {
            farmer = new Farmer();
            farmer.setId(UUID.randomUUID().toString());
            farmer.setPhone(phone);
            farmer.setName("New Farmer User");
            farmerRepository.save(farmer);
        }

        String token = jwtUtil.generateToken(farmer.getId(), "FARMER");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("profileCompleted", profileCompleted);
        response.put("farmerProfile", farmer);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/mandi/login")
    public ResponseEntity<?> sendMandiOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.get("mobileNumber");
        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile number is required."));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "OTP sent successfully to " + phone + ". Sandbox code is 456789"
        ));
    }

    @PostMapping("/mandi/verify-otp")
    public ResponseEntity<?> verifyMandiOtp(@RequestBody Map<String, String> payload) {
        String phone = payload.get("mobileNumber");
        String pin = payload.get("otp");

        if (phone == null || pin == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Mobile number and PIN are required."));
        }

        // Sandbox PIN check
        if (!"456789".equals(pin)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid login PIN."));
        }

        String operatorId = "operator-" + phone;
        String token = jwtUtil.generateToken(operatorId, "OPERATOR");

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("operatorProfile", Map.of(
            "id", operatorId,
            "role", "OPERATOR",
            "name", "Mandi Operator " + phone.substring(Math.max(0, phone.length() - 4))
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String token) {
        String userId = jwtUtil.getUserIdFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        if (userId == null || role == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Session expired or invalid."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("role", role);

        if ("FARMER".equals(role)) {
            Optional<Farmer> farmerOpt = farmerRepository.findById(userId);
            if (farmerOpt.isPresent()) {
                Farmer farmer = farmerOpt.get();
                response.put("farmerProfile", farmer);
                Optional<BankAccount> bankOpt = bankAccountRepository.findByFarmerId(userId);
                response.put("profileCompleted", bankOpt.isPresent() && farmer.getName() != null && !"New Farmer User".equals(farmer.getName()));
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Signed out successfully."));
    }
}
