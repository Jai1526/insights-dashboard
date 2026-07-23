class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final bool isVerified;
  final String avatar;
  final String company;
  final String jobTitle;
  final DateTime createdAt;
  final DateTime? lastLogin;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isVerified,
    required this.avatar,
    required this.company,
    required this.jobTitle,
    required this.createdAt,
    this.lastLogin,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'user',
      isVerified: json['isVerified'] ?? false,
      avatar: json['avatar'] ?? '',
      company: json['company'] ?? '',
      jobTitle: json['jobTitle'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      lastLogin: json['lastLogin'] != null ? DateTime.tryParse(json['lastLogin']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'avatar': avatar,
    'company': company,
    'jobTitle': jobTitle,
  };
}