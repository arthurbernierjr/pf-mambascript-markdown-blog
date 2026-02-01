---
title: "Java API Development"
subTitle: "Building APIs with Spring Boot"
excerpt: "Spring Boot makes Java API development surprisingly pleasant."
featureImage: "/img/java-api.png"
date: "2026-02-01"
order: 84
---

# Explanation

## Java Web Frameworks

Java has mature frameworks for building robust APIs. Spring Boot is the industry standard, offering convention over configuration and extensive ecosystem support.

### Framework Comparison

| Framework | Use Case | Learning Curve |
|-----------|----------|----------------|
| Spring Boot | Enterprise APIs | Moderate |
| Quarkus | Cloud-native | Moderate |
| Micronaut | Microservices | Moderate |
| Jakarta EE | Enterprise | High |

---

# Demonstration

## Example 1: Spring Boot Basics

```java
// Application entry point
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters, setters, constructors
}

// Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByNameContaining(String name);

    @Query("SELECT u FROM User u WHERE u.createdAt > :date")
    List<User> findRecentUsers(@Param("date") LocalDateTime date);
}

// DTO
public record UserDTO(
    Long id,
    String name,
    String email,
    LocalDateTime createdAt
) {
    public static UserDTO from(User user) {
        return new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getCreatedAt()
        );
    }
}

public record CreateUserRequest(
    @NotBlank String name,
    @Email @NotBlank String email
) {}

// Controller
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Page<User> users = userService.findAll(PageRequest.of(page, size));
        List<UserDTO> dtos = users.getContent().stream()
            .map(UserDTO::from)
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(UserDTO::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(
        @Valid @RequestBody CreateUserRequest request
    ) {
        User user = userService.create(request.name(), request.email());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(UserDTO.from(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody CreateUserRequest request
    ) {
        return userService.update(id, request.name(), request.email())
            .map(UserDTO::from)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Example 2: Service Layer

```java
// Service interface
public interface UserService {
    Page<User> findAll(Pageable pageable);
    Optional<User> findById(Long id);
    User create(String name, String email);
    Optional<User> update(Long id, String name, String email);
    void delete(Long id);
}

// Service implementation
@Service
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public User create(String name, String email) {
        // Check for duplicate email
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateEmailException(email);
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    @Override
    public Optional<User> update(Long id, String name, String email) {
        return userRepository.findById(id)
            .map(user -> {
                user.setName(name);
                user.setEmail(email);
                return userRepository.save(user);
            });
    }

    @Override
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }
}
```

## Example 3: Exception Handling

```java
// Custom exceptions
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }
}

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("Email already in use: " + email);
    }
}

// Error response
public record ErrorResponse(
    String code,
    String message,
    LocalDateTime timestamp,
    List<FieldError> errors
) {
    public record FieldError(String field, String message) {}

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(code, message, LocalDateTime.now(), null);
    }

    public static ErrorResponse withErrors(String code, String message, List<FieldError> errors) {
        return new ErrorResponse(code, message, LocalDateTime.now(), errors);
    }
}

// Global exception handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.of("USER_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ErrorResponse.of("DUPLICATE_EMAIL", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(e -> new ErrorResponse.FieldError(e.getField(), e.getDefaultMessage()))
            .toList();

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.withErrors(
                "VALIDATION_ERROR",
                "Validation failed",
                errors
            ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        // Log the actual error
        log.error("Unhandled exception", ex);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.of("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

## Example 4: Authentication with Spring Security

```java
// Security configuration
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                new JwtTokenFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class
            )
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// JWT Token Provider
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long validityInMs;

    public String createToken(String username, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roles", roles);

        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS256, secretKey)
            .compact();
    }

    public Authentication getAuthentication(String token) {
        UserDetails userDetails = loadUserByUsername(getUsername(token));
        return new UsernamePasswordAuthenticationToken(
            userDetails, "", userDetails.getAuthorities()
        );
    }

    public String getUsername(String token) {
        return Jwts.parser()
            .setSigningKey(secretKey)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

// Auth Controller
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.email(),
                    request.password()
                )
            );

            User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException(request.email()));

            String token = jwtTokenProvider.createToken(
                user.getEmail(),
                user.getRoles()
            );

            return ResponseEntity.ok(new AuthResponse(token, UserDTO.from(user)));
        } catch (AuthenticationException e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.create(
            request.name(),
            request.email(),
            request.password()
        );

        String token = jwtTokenProvider.createToken(
            user.getEmail(),
            user.getRoles()
        );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(new AuthResponse(token, UserDTO.from(user)));
    }
}

public record LoginRequest(
    @Email @NotBlank String email,
    @NotBlank String password
) {}

public record AuthResponse(String token, UserDTO user) {}
```

## Example 5: Testing

```java
// Controller test
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnAllUsers() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("Arthur");
        user.setEmail("art@bpc.com");

        when(userService.findAll(any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(user)));

        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Arthur"))
            .andExpect(jsonPath("$[0].email").value("art@bpc.com"));
    }

    @Test
    void shouldCreateUser() throws Exception {
        CreateUserRequest request = new CreateUserRequest("Arthur", "art@bpc.com");

        User user = new User();
        user.setId(1L);
        user.setName(request.name());
        user.setEmail(request.email());

        when(userService.create(request.name(), request.email()))
            .thenReturn(user);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Arthur"));
    }

    @Test
    void shouldReturn404WhenUserNotFound() throws Exception {
        when(userService.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/users/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldValidateRequest() throws Exception {
        CreateUserRequest request = new CreateUserRequest("", "invalid");

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}

// Integration test
@SpringBootTest
@AutoConfigureMockMvc
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldCreateAndRetrieveUser() throws Exception {
        // Create
        String json = """
            {"name": "Arthur", "email": "art@bpc.com"}
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andReturn();

        // Parse response
        String responseJson = result.getResponse().getContentAsString();
        Long id = JsonPath.parse(responseJson).read("$.id", Long.class);

        // Retrieve
        mockMvc.perform(get("/api/v1/users/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Arthur"));
    }
}
```

## Example 6: API Documentation with OpenAPI

```java
// OpenAPI configuration
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("User API")
                .version("1.0")
                .description("API for managing users")
                .contact(new Contact()
                    .name("Big Poppa Code")
                    .email("art@bpc.com")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}

// Controller with documentation
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User management API")
public class UserController {

    @Operation(
        summary = "Get all users",
        description = "Returns a paginated list of all users"
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Success"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size
    ) {
        // ...
    }

    @Operation(summary = "Create a new user")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User created"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    @PostMapping
    public ResponseEntity<UserDTO> createUser(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User to create",
            required = true
        )
        @Valid @RequestBody CreateUserRequest request
    ) {
        // ...
    }
}
```

**Key Takeaways:**
- Spring Boot simplifies Java API development
- Use DTOs to control API responses
- Global exception handling for consistency
- Spring Security for authentication
- Comprehensive testing is essential

---

# Imitation

### Challenge 1: Build a Product API

**Task:** Create a complete CRUD API for products with categories.

<details>
<summary>Solution</summary>

```java
// Entity
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @Positive
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

// Service
@Service
public class ProductService {
    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    public Product create(CreateProductRequest request) {
        Category category = categoryRepo.findById(request.categoryId())
            .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setCategory(category);

        return productRepo.save(product);
    }

    public Page<Product> findAll(Pageable pageable) {
        return productRepo.findAll(pageable);
    }

    public Page<Product> findByCategory(Long categoryId, Pageable pageable) {
        return productRepo.findByCategoryId(categoryId, pageable);
    }
}

// Controller
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getProducts(
        @RequestParam(required = false) Long categoryId,
        Pageable pageable
    ) {
        Page<Product> products = categoryId != null
            ? productService.findByCategory(categoryId, pageable)
            : productService.findAll(pageable);

        return ResponseEntity.ok(products.map(ProductDTO::from));
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
        @Valid @RequestBody CreateProductRequest request
    ) {
        Product product = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ProductDTO.from(product));
    }
}
```

</details>

---

# Practice

### Exercise 1: Add Caching
**Difficulty:** Intermediate

Implement caching with Spring Cache:
- Cache GET responses
- Evict on updates
- Time-based expiration

### Exercise 2: Rate Limiting
**Difficulty:** Advanced

Add rate limiting:
- Bucket4j or custom implementation
- Per-user limits
- Rate limit headers

---

## Summary

**What you learned:**
- Spring Boot fundamentals
- REST controller patterns
- Service layer design
- Exception handling
- Security and testing

**Next Steps:**
- Read: [Java OOP](/api/guides/java/oop)
- Practice: Add WebSocket support
- Explore: Spring WebFlux

---

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-boot)
- [Big Poppa Code YouTube](https://youtube.com/@bigpoppacode)
