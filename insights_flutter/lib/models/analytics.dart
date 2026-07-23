class AnalyticsOverview {
  final String range;
  final double totalRevenue;
  final int activeUsers;
  final double conversionRate;
  final String avgSessionDuration;

  AnalyticsOverview({
    required this.range,
    required this.totalRevenue,
    required this.activeUsers,
    required this.conversionRate,
    required this.avgSessionDuration,
  });

  factory AnalyticsOverview.fromJson(Map<String, dynamic> json) {
    return AnalyticsOverview(
      range: json['range'] ?? 'month',
      totalRevenue: (json['totalRevenue'] ?? 0).toDouble(),
      activeUsers: json['activeUsers'] ?? 0,
      conversionRate: (json['conversionRate'] ?? 0).toDouble(),
      avgSessionDuration: json['avgSessionDuration'] ?? '0m 0s',
    );
  }
}

class TrafficChartData {
  final String range;
  final List<int> data;

  TrafficChartData({required this.range, required this.data});

  factory TrafficChartData.fromJson(Map<String, dynamic> json) {
    return TrafficChartData(
      range: json['range'] ?? 'month',
      data: (json['data'] as List<dynamic>?)?.map((e) => (e as num).toInt()).toList() ?? [],
    );
  }
}

class TrafficSource {
  final String source;
  final int count;
  final double percentage;

  TrafficSource({required this.source, required this.count, required this.percentage});

  factory TrafficSource.fromJson(Map<String, dynamic> json) {
    return TrafficSource(
      source: json['source'] ?? '',
      count: json['count'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
    );
  }
}

class ActivityLogItem {
  final String type;
  final String message;
  final String? amount;
  final DateTime timestamp;

  ActivityLogItem({
    required this.type,
    required this.message,
    this.amount,
    required this.timestamp,
  });

  factory ActivityLogItem.fromJson(Map<String, dynamic> json) {
    return ActivityLogItem(
      type: json['type'] ?? 'info',
      message: json['message'] ?? '',
      amount: json['amount'],
      timestamp: DateTime.tryParse(json['timestamp'] ?? '') ?? DateTime.now(),
    );
  }
}

class PanelAnalytics {
  final int pageViews;
  final double bounceRate;
  final String avgTimeOnPage;

  PanelAnalytics({
    required this.pageViews,
    required this.bounceRate,
    required this.avgTimeOnPage,
  });

  factory PanelAnalytics.fromJson(Map<String, dynamic> json) {
    return PanelAnalytics(
      pageViews: json['pageViews'] ?? 0,
      bounceRate: (json['bounceRate'] ?? 0).toDouble(),
      avgTimeOnPage: json['avgTimeOnPage'] ?? '0m 0s',
    );
  }
}

class AudienceData {
  final int totalAudience;
  final int newUsers;
  final double engagementRate;

  AudienceData({
    required this.totalAudience,
    required this.newUsers,
    required this.engagementRate,
  });

  factory AudienceData.fromJson(Map<String, dynamic> json) {
    return AudienceData(
      totalAudience: json['totalAudience'] ?? 0,
      newUsers: json['newUsers'] ?? 0,
      engagementRate: (json['engagementRate'] ?? 0).toDouble(),
    );
  }
}

class RevenueData {
  final double mrr;
  final double arr;
  final double churnRate;

  RevenueData({required this.mrr, required this.arr, required this.churnRate});

  factory RevenueData.fromJson(Map<String, dynamic> json) {
    return RevenueData(
      mrr: (json['mrr'] ?? 0).toDouble(),
      arr: (json['arr'] ?? 0).toDouble(),
      churnRate: (json['churnRate'] ?? 0).toDouble(),
    );
  }
}

class CampaignItem {
  final String name;
  final String status;

  CampaignItem({required this.name, required this.status});

  factory CampaignItem.fromJson(Map<String, dynamic> json) {
    return CampaignItem(name: json['name'] ?? '', status: json['status'] ?? '');
  }
}

class SegmentItem {
  final String name;
  final String count;

  SegmentItem({required this.name, required this.count});

  factory SegmentItem.fromJson(Map<String, dynamic> json) {
    return SegmentItem(name: json['name'] ?? '', count: json['count'] ?? '');
  }
}

class RevenueListItem {
  final String name;
  final String amount;

  RevenueListItem({required this.name, required this.amount});

  factory RevenueListItem.fromJson(Map<String, dynamic> json) {
    return RevenueListItem(name: json['name'] ?? '', amount: json['amount'] ?? '');
  }
}