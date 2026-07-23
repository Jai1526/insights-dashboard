import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Flexible response that can be either a JSON object or a JSON array.
class ApiResponse {
  final Map<String, dynamic>? map;
  final List<dynamic>? list;
  final int statusCode;

  ApiResponse({this.map, this.list, required this.statusCode});

  bool get isMap => map != null;
  bool get isList => list != null;

  /// Safely get a value from the map response
  dynamic operator [](String key) => map?[key];

  /// Safely get data — if it's a list, return it; if it's a map with 'data' key, return that
  List<dynamic>? get dataList => list ?? (map?['data'] as List<dynamic>?);

  /// Get a nested map
  Map<String, dynamic>? getMap(String key) => map?[key] as Map<String, dynamic>?;
}

class ApiService {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _baseUrlKey = 'api_base_url';

  static String _baseUrl = 'http://localhost:5000/api';

  static Future<void> init() async {
    final savedUrl = await _storage.read(key: _baseUrlKey);
    if (savedUrl != null && savedUrl.isNotEmpty) {
      _baseUrl = savedUrl;
    }
  }

  static String get baseUrl => _baseUrl;

  static Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    await _storage.write(key: _baseUrlKey, value: url);
  }

  static Future<String?> getToken() => _storage.read(key: _tokenKey);

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  static Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }

  static Future<Map<String, String>> _headers({bool auth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  static Future<ApiResponse> get(String endpoint, {bool auth = true}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl$endpoint'),
      headers: await _headers(auth: auth),
    );
    return _handleResponse(response);
  }

  static Future<ApiResponse> post(String endpoint, Map<String, dynamic> body, {bool auth = true}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl$endpoint'),
      headers: await _headers(auth: auth),
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  static Future<ApiResponse> put(String endpoint, Map<String, dynamic> body, {bool auth = true}) async {
    final response = await http.put(
      Uri.parse('$_baseUrl$endpoint'),
      headers: await _headers(auth: auth),
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  static Future<ApiResponse> delete(String endpoint, {bool auth = true}) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl$endpoint'),
      headers: await _headers(auth: auth),
    );
    return _handleResponse(response);
  }

  static Future<ApiResponse> uploadFile(
    String endpoint,
    File file, {
    bool auth = true,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl$endpoint'),
    );
    if (auth) {
      final token = await getToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
    }
    request.files.add(await http.MultipartFile.fromPath('file', file.path));
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  static ApiResponse _handleResponse(http.Response response) {
    final decoded = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is List) {
        return ApiResponse(list: decoded, statusCode: response.statusCode);
      } else if (decoded is Map) {
        return ApiResponse(
          map: decoded as Map<String, dynamic>,
          statusCode: response.statusCode,
        );
      } else {
        return ApiResponse(
          map: {'data': decoded},
          statusCode: response.statusCode,
        );
      }
    } else {
      final msg = decoded is Map
          ? (decoded['error'] as String? ?? decoded['message'] as String? ?? 'Unknown error')
          : 'Unknown error';
      throw ApiException(statusCode: response.statusCode, message: msg);
    }
  }
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException({required this.statusCode, required this.message});

  @override
  String toString() => 'ApiException($statusCode): $message';
}