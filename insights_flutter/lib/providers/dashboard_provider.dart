import 'package:flutter/foundation.dart';
import '../models/analytics.dart';
import '../services/api_service.dart';

class DashboardProvider extends ChangeNotifier {
  // Data
  AnalyticsOverview? _overview;
  TrafficChartData? _trafficChart;
  List<TrafficSource> _sources = [];
  List<ActivityLogItem> _activity = [];
  PanelAnalytics? _panelAnalytics;
  AudienceData? _audienceData;
  RevenueData? _revenueData;
  List<CampaignItem> _campaigns = [];
  List<SegmentItem> _segments = [];
  List<RevenueListItem> _revenueList = [];

  // State
  bool _isLoading = false;
  String? _error;
  String _selectedRange = 'month';
  bool _isLive = true;

  // Getters
  AnalyticsOverview? get overview => _overview;
  TrafficChartData? get trafficChart => _trafficChart;
  List<TrafficSource> get sources => _sources;
  List<ActivityLogItem> get activity => _activity;
  PanelAnalytics? get panelAnalytics => _panelAnalytics;
  AudienceData? get audienceData => _audienceData;
  RevenueData? get revenueData => _revenueData;
  List<CampaignItem> get campaigns => _campaigns;
  List<SegmentItem> get segments => _segments;
  List<RevenueListItem> get revenueList => _revenueList;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get selectedRange => _selectedRange;
  bool get isLive => _isLive;

  void setRange(String range) {
    _selectedRange = range;
    notifyListeners();
    refreshAll();
  }

  void toggleLive() {
    _isLive = !_isLive;
    notifyListeners();
  }

  Future<void> refreshAll() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    // Run all fetches in parallel for speed
    await Future.wait([
      fetchOverview(),
      fetchTrafficChart(),
      fetchSources(),
      fetchActivity(),
      fetchPanelAnalytics(),
      fetchAudience(),
      fetchRevenue(),
      fetchCampaigns(),
      fetchSegments(),
      fetchRevenueList(),
    ]);

    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchOverview() async {
    try {
      final response = await ApiService.get('/analytics/overview?range=$_selectedRange');
      if (response.isMap) {
        _overview = AnalyticsOverview.fromJson(response.map!);
      }
    } catch (e) {
      _error = 'Failed to load overview';
    }
  }

  Future<void> fetchTrafficChart() async {
    try {
      final response = await ApiService.get('/analytics/traffic-chart?range=$_selectedRange');
      if (response.isMap) {
        _trafficChart = TrafficChartData.fromJson(response.map!);
      }
    } catch (e) {
      // Silently fail for charts
    }
  }

  Future<void> fetchSources() async {
    try {
      final response = await ApiService.get('/analytics/sources?range=$_selectedRange');
      if (response.isMap) {
        final dataList = response.dataList;
        if (dataList != null) {
          _sources = dataList
              .map((e) => TrafficSource.fromJson(e as Map<String, dynamic>))
              .toList();
        } else {
          _sources = [];
        }
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchActivity() async {
    try {
      final response = await ApiService.get('/analytics/activity');
      // Activity can be a top-level list
      final items = response.list ?? response.dataList ?? [];
      _activity = items
          .map((e) => ActivityLogItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchPanelAnalytics() async {
    try {
      final response = await ApiService.get('/analytics/panel/analytics?range=$_selectedRange');
      if (response.isMap) {
        _panelAnalytics = PanelAnalytics.fromJson(response.map!);
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchAudience() async {
    try {
      final response = await ApiService.get('/analytics/panel/audience?range=$_selectedRange');
      if (response.isMap) {
        _audienceData = AudienceData.fromJson(response.map!);
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchRevenue() async {
    try {
      final response = await ApiService.get('/analytics/panel/revenue?range=$_selectedRange');
      if (response.isMap) {
        _revenueData = RevenueData.fromJson(response.map!);
      }
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchCampaigns() async {
    try {
      final response = await ApiService.get('/analytics/panel/campaigns');
      final items = response.list ?? response.dataList ?? [];
      _campaigns = items
          .map((e) => CampaignItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchSegments() async {
    try {
      final response = await ApiService.get('/analytics/panel/segments');
      final items = response.list ?? response.dataList ?? [];
      _segments = items
          .map((e) => SegmentItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> fetchRevenueList() async {
    try {
      final response = await ApiService.get('/analytics/panel/revenue-list');
      final items = response.list ?? response.dataList ?? [];
      _revenueList = items
          .map((e) => RevenueListItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      // Silently fail
    }
  }

  Future<bool> createEvent({
    required String source,
    required int duration,
    double revenue = 0,
  }) async {
    try {
      await ApiService.post('/analytics/event', {
        'source': source,
        'duration': duration,
        'revenue': revenue,
      });
      refreshAll();
      return true;
    } catch (e) {
      _error = 'Failed to create event';
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>> bulkImport(String csvContent) async {
    try {
      final response = await ApiService.post('/analytics/bulk-import', {
        'data': csvContent,
      });
      refreshAll();
      return response.map ?? {'error': 'Unexpected response'};
    } catch (e) {
      _error = 'Failed to import data';
      notifyListeners();
      return {'error': _error};
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}