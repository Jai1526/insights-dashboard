import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isAuthenticated = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      }, auth: false);

      if (!response.isMap) {
        _error = 'Unexpected response format';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final token = response['token'] as String?;
      if (token == null) {
        _error = 'No token received';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      await ApiService.saveToken(token);

      final userMap = response.getMap('user');
      if (userMap != null) {
        _user = User.fromJson(userMap);
      }
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Connection failed. Check your server URL.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
      }, auth: false);

      if (!response.isMap) {
        _error = 'Unexpected response format';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final token = response['token'] as String?;
      if (token == null) {
        _error = 'No token received';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      await ApiService.saveToken(token);

      final userMap = response.getMap('user');
      if (userMap != null) {
        _user = User.fromJson(userMap);
      }
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'Connection failed. Check your server URL.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadUser() async {
    final token = await ApiService.getToken();
    if (token == null) return;

    try {
      final response = await ApiService.get('/auth/me');
      if (!response.isMap) return;
      final userMap = response.getMap('user') ?? response.map;
      if (userMap != null) {
        _user = User.fromJson(userMap);
        _isAuthenticated = true;
      }
      notifyListeners();
    } catch (_) {
      await ApiService.clearToken();
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.put('/auth/profile', data);
      if (!response.isMap) return false;
      final userMap = response.getMap('user');
      if (userMap != null) {
        _user = User.fromJson(userMap);
      }
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    try {
      await ApiService.put('/auth/password', {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiService.clearToken();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}