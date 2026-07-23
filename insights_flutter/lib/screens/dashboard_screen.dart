import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedNavIndex = 0;
  bool _sidebarCollapsed = false;

  final List<String> _navItems = [
    'Overview', 'Analytics', 'Audience', 'Revenue', 'Reports', 'Profile'
  ];

  final List<IconData> _navIcons = [
    Icons.dashboard_rounded, Icons.analytics_rounded, Icons.people_rounded,
    Icons.attach_money_rounded, Icons.description_rounded, Icons.person_rounded,
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().refreshAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: Row(
        children: [
          // Sidebar
          _buildSidebar(theme, isDark),
          // Main content
          Expanded(
            child: Column(
              children: [
                _buildTopBar(theme, isDark),
                Expanded(
                  child: _buildContent(theme),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar(ThemeData theme, bool isDark) {
    final width = _sidebarCollapsed ? 72.0 : 260.0;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: width,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          right: BorderSide(color: theme.dividerColor.withValues(alpha: 0.5)),
        ),
      ),
      child: Column(
        children: [
          // Brand
          Container(
            padding: EdgeInsets.symmetric(
              horizontal: _sidebarCollapsed ? 0 : 20,
              vertical: 20,
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text('✦',
                    style: TextStyle(
                      fontSize: 20,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ),
                if (!_sidebarCollapsed) ...[
                  const SizedBox(width: 12),
                  Text('Insights',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
                const Spacer(),
                if (!_sidebarCollapsed)
                  IconButton(
                    icon: const Icon(Icons.chevron_left, size: 20),
                    onPressed: () => setState(() => _sidebarCollapsed = true),
                  ),
              ],
            ),
          ),
          const Divider(height: 1),
          // Navigation
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _navItems.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedNavIndex == index;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  child: Material(
                    color: isSelected
                        ? theme.colorScheme.primaryContainer
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () => setState(() => _selectedNavIndex = index),
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: _sidebarCollapsed ? 0 : 16,
                          vertical: 12,
                        ),
                        child: Row(
                          mainAxisAlignment: _sidebarCollapsed
                              ? MainAxisAlignment.center
                              : MainAxisAlignment.start,
                          children: [
                            Icon(
                              _navIcons[index],
                              size: 22,
                              color: isSelected
                                  ? theme.colorScheme.primary
                                  : theme.colorScheme.onSurfaceVariant,
                            ),
                            if (!_sidebarCollapsed) ...[
                              const SizedBox(width: 12),
                              Text(
                                _navItems[index],
                                style: TextStyle(
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                  color: isSelected
                                      ? theme.colorScheme.primary
                                      : theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          // Logout
          Padding(
            padding: const EdgeInsets.all(8),
            child: Material(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () {
                  context.read<AuthProvider>().logout();
                  Navigator.of(context).pushReplacementNamed('/login');
                },
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: _sidebarCollapsed ? 0 : 16,
                    vertical: 12,
                  ),
                  child: Row(
                    mainAxisAlignment: _sidebarCollapsed
                        ? MainAxisAlignment.center
                        : MainAxisAlignment.start,
                    children: [
                      Icon(Icons.logout_rounded,
                        color: theme.colorScheme.error, size: 22),
                      if (!_sidebarCollapsed) ...[
                        const SizedBox(width: 12),
                        Text('Logout',
                          style: TextStyle(color: theme.colorScheme.error),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar(ThemeData theme, bool isDark) {
    final dashboard = context.watch<DashboardProvider>();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: theme.dividerColor.withValues(alpha: 0.5)),
        ),
      ),
      child: Row(
        children: [
          if (_sidebarCollapsed)
            IconButton(
              icon: const Icon(Icons.menu_rounded),
              onPressed: () => setState(() => _sidebarCollapsed = false),
            ),
          Expanded(
            child: Text(
              _navItems[_selectedNavIndex],
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
          // Live indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: dashboard.isLive
                  ? Colors.green.withValues(alpha: 0.1)
                  : theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: dashboard.isLive ? Colors.green : Colors.grey,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  dashboard.isLive ? 'Live' : 'Paused',
                  style: TextStyle(
                    fontSize: 12,
                    color: dashboard.isLive ? Colors.green : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Refresh button
          IconButton(
            icon: dashboard.isLoading
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh_rounded),
            onPressed: dashboard.isLoading ? null : () => dashboard.refreshAll(),
          ),
          // Theme toggle
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
            onPressed: () {
              // Theme toggle handled by main.dart
            },
          ),
        ],
      ),
    );
  }

  Widget _buildContent(ThemeData theme) {
    final dashboard = context.watch<DashboardProvider>();

    if (dashboard.isLoading && dashboard.overview == null) {
      return const Center(child: CircularProgressIndicator());
    }

    switch (_selectedNavIndex) {
      case 0: return _buildOverview(theme, dashboard);
      case 1: return _buildAnalytics(theme, dashboard);
      case 2: return _buildAudience(theme, dashboard);
      case 3: return _buildRevenue(theme, dashboard);
      case 4: return _buildReports(theme);
      case 5: return _buildProfile(theme);
      default: return const SizedBox();
    }
  }

  Widget _buildOverview(ThemeData theme, DashboardProvider dashboard) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero section
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  theme.colorScheme.primaryContainer,
                  theme.colorScheme.secondaryContainer,
                ],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Live performance pulse',
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Turn raw traffic into confident decisions.',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                FilledButton.icon(
                  onPressed: () => _showAddEventDialog(context),
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Quick-add Event'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Stat cards
          Row(
            children: [
              _buildStatCard(theme, 'Total Revenue',
                '\$${NumberFormat('#,##0.00').format(dashboard.overview?.totalRevenue ?? 0)}',
                Icons.trending_up, Colors.green),
              _buildStatCard(theme, 'Active Users',
                '${dashboard.overview?.activeUsers ?? 0}',
                Icons.people, Colors.blue),
              _buildStatCard(theme, 'Conversion Rate',
                '${dashboard.overview?.conversionRate ?? 0}%',
                Icons.track_changes, Colors.orange),
              _buildStatCard(theme, 'Avg. Session',
                dashboard.overview?.avgSessionDuration ?? '0m 0s',
                Icons.timer_outlined, Colors.purple),
            ],
          ),
          const SizedBox(height: 24),

          // Charts row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Traffic chart
              Expanded(
                flex: 3,
                child: _buildChartPanel(theme, dashboard),
              ),
              const SizedBox(width: 16),
              // Sources donut
              Expanded(
                flex: 2,
                child: _buildSourcesPanel(theme, dashboard),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Activity and table
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _buildActivityPanel(theme, dashboard),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildPanelAnalytics(theme, dashboard),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(ThemeData theme, String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(label, style: theme.textTheme.labelSmall),
                  Icon(icon, color: color, size: 20),
                ],
              ),
              const SizedBox(height: 8),
              Text(value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChartPanel(ThemeData theme, DashboardProvider dashboard) {
    final chartData = dashboard.trafficChart;
    final labels = chartData?.range == 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : chartData?.range == 'year'
            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Traffic Overview', style: theme.textTheme.titleMedium),
                Row(
                  children: ['week', 'month', 'year'].map((r) {
                    final isSelected = dashboard.selectedRange == r;
                    return Padding(
                      padding: const EdgeInsets.only(left: 4),
                      child: ChoiceChip(
                        label: Text(r[0].toUpperCase() + r.substring(1)),
                        selected: isSelected,
                        onSelected: (_) => dashboard.setRange(r),
                        visualDensity: VisualDensity.compact,
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: chartData != null && chartData.data.isNotEmpty
                  ? BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: (chartData.data.reduce((a, b) => a > b ? a : b) * 1.2).toDouble(),
                        barGroups: chartData.data.asMap().entries.map((e) {
                          return BarChartGroupData(
                            x: e.key,
                            barRods: [
                              BarChartRodData(
                                toY: e.value.toDouble(),
                                color: theme.colorScheme.primary,
                                width: chartData.range == 'year' ? 8 : 20,
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(4),
                                  topRight: Radius.circular(4),
                                ),
                              ),
                            ],
                          );
                        }).toList(),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                final index = value.toInt();
                                if (index >= 0 && index < labels.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(labels[index],
                                      style: const TextStyle(fontSize: 10),
                                    ),
                                  );
                                }
                                return const SizedBox();
                              },
                            ),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: true, reservedSize: 30),
                          ),
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        gridData: FlGridData(
                          show: true,
                          drawVerticalLine: false,
                          horizontalInterval: chartData.data.isNotEmpty
                              ? (chartData.data.reduce((a, b) => a > b ? a : b) / 4).ceilToDouble().clamp(1, double.infinity)
                              : 1,
                        ),
                        borderData: FlBorderData(show: false),
                      ),
                    )
                  : const Center(child: Text('No data available')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSourcesPanel(ThemeData theme, DashboardProvider dashboard) {
    final sources = dashboard.sources;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Traffic Sources', style: theme.textTheme.titleMedium),
            const SizedBox(height: 16),
            SizedBox(
              height: 150,
              child: sources.isNotEmpty
                  ? PieChart(
                      PieChartData(
                        sections: sources.asMap().entries.map((e) {
                          final colors = [
                            theme.colorScheme.primary,
                            theme.colorScheme.secondary,
                            theme.colorScheme.tertiary,
                            theme.colorScheme.error,
                          ];
                          return PieChartSectionData(
                            value: e.value.percentage,
                            title: '${e.value.percentage.toStringAsFixed(0)}%',
                            color: colors[e.key % colors.length],
                            radius: 50,
                            titleStyle: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          );
                        }).toList(),
                        sectionsSpace: 2,
                        centerSpaceRadius: 30,
                      ),
                    )
                  : const Center(child: Text('No data')),
            ),
            const SizedBox(height: 12),
            ...sources.map((s) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Text('${s.source}: ', style: theme.textTheme.bodySmall),
                  Text('${s.count} (${s.percentage.toStringAsFixed(1)}%)',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityPanel(ThemeData theme, DashboardProvider dashboard) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Activity', style: theme.textTheme.titleMedium),
                TextButton(onPressed: () {}, child: const Text('View all')),
              ],
            ),
            const SizedBox(height: 8),
            ...dashboard.activity.take(5).map((a) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: a.type == 'success'
                          ? Colors.green.withValues(alpha: 0.1)
                          : a.type == 'warning'
                              ? Colors.orange.withValues(alpha: 0.1)
                              : Colors.blue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Icon(
                      a.type == 'success'
                          ? Icons.check_circle
                          : a.type == 'warning'
                              ? Icons.warning_amber_rounded
                              : Icons.info_outline,
                      size: 16,
                      color: a.type == 'success'
                          ? Colors.green
                          : a.type == 'warning'
                              ? Colors.orange
                              : Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(a.message, style: theme.textTheme.bodySmall),
                        if (a.amount != null)
                          Text(a.amount!,
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildPanelAnalytics(ThemeData theme, DashboardProvider dashboard) {
    final panel = dashboard.panelAnalytics;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Page Analytics', style: theme.textTheme.titleMedium),
            const SizedBox(height: 16),
            if (panel != null) ...[
              _buildMetricRow(theme, 'Page Views', '${panel.pageViews}'),
              const Divider(height: 20),
              _buildMetricRow(theme, 'Bounce Rate', '${panel.bounceRate}%'),
              const Divider(height: 20),
              _buildMetricRow(theme, 'Avg Time on Page', panel.avgTimeOnPage),
            ] else
              const Text('No data available'),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricRow(ThemeData theme, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium),
        Text(value, style: theme.textTheme.titleSmall?.copyWith(
          fontWeight: FontWeight.bold,
        )),
      ],
    );
  }

  Widget _buildAnalytics(ThemeData theme, DashboardProvider dashboard) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Channel Efficiency', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildMetricCard(theme, 'Page Views',
                '${dashboard.panelAnalytics?.pageViews ?? 0}', Icons.visibility)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'Bounce Rate',
                '${dashboard.panelAnalytics?.bounceRate ?? 0}%', Icons.arrow_downward)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'Avg Time',
                dashboard.panelAnalytics?.avgTimeOnPage ?? '0m', Icons.timer)),
            ],
          ),
          const SizedBox(height: 24),
          Text('Campaign Momentum', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          ...dashboard.campaigns.map((c) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: Icon(
                c.status == 'Active'
                    ? Icons.play_circle
                    : c.status == 'Draft'
                        ? Icons.edit_note
                        : Icons.schedule,
                color: c.status == 'Active'
                    ? Colors.green
                    : c.status == 'Draft'
                        ? Colors.orange
                        : Colors.blue,
              ),
              title: Text(c.name),
              trailing: Chip(
                label: Text(c.status, style: const TextStyle(fontSize: 12)),
                visualDensity: VisualDensity.compact,
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildMetricCard(ThemeData theme, String label, String value, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, color: theme.colorScheme.primary),
            const SizedBox(height: 8),
            Text(value, style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
            )),
            Text(label, style: theme.textTheme.bodySmall),
          ],
        ),
      ),
    );
  }

  Widget _buildAudience(ThemeData theme, DashboardProvider dashboard) {
    final audience = dashboard.audienceData;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Audience Overview', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildMetricCard(theme, 'Total Audience',
                '${audience?.totalAudience ?? 0}', Icons.people)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'New Users',
                '${audience?.newUsers ?? 0}', Icons.person_add)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'Engagement',
                '${audience?.engagementRate ?? 0}%', Icons.favorite)),
            ],
          ),
          const SizedBox(height: 24),
          Text('Segments', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          ...dashboard.segments.map((s) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: const Icon(Icons.group_rounded),
              title: Text(s.name),
              trailing: Text(s.count),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildRevenue(ThemeData theme, DashboardProvider dashboard) {
    final revenue = dashboard.revenueData;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Revenue Outlook', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildMetricCard(theme, 'MRR',
                '\$${NumberFormat('#,##0.0').format(revenue?.mrr ?? 0)}', Icons.trending_up)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'ARR',
                '\$${NumberFormat('#,##0.0').format(revenue?.arr ?? 0)}', Icons.account_balance)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard(theme, 'Churn Rate',
                '${revenue?.churnRate ?? 0}%', Icons.person_off)),
            ],
          ),
          const SizedBox(height: 24),
          Text('Pipeline Activity', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          ...dashboard.revenueList.map((r) => Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: const Icon(Icons.receipt_long),
              title: Text(r.name),
              trailing: Text(r.amount,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.primary,
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildReports(ThemeData theme) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Report Queue', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.description),
                    title: const Text('Executive Recap'),
                    subtitle: const Text('Weekly · Executive team'),
                    trailing: Chip(
                      label: const Text('Scheduled', style: TextStyle(fontSize: 12)),
                      backgroundColor: Colors.blue.withValues(alpha: 0.1),
                    ),
                  ),
                  const Divider(),
                  ListTile(
                    leading: const Icon(Icons.description),
                    title: const Text('Marketing Performance'),
                    subtitle: const Text('Monthly · Marketing'),
                    trailing: Chip(
                      label: const Text('Draft', style: TextStyle(fontSize: 12)),
                      backgroundColor: Colors.orange.withValues(alpha: 0.1),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text('Create a Report', style: theme.textTheme.titleLarge),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Report name',
                      border: OutlineInputBorder(),
                    ),
                    controller: TextEditingController(text: 'Executive recap'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField(
                    decoration: const InputDecoration(
                      labelText: 'Audience',
                      border: OutlineInputBorder(),
                    ),
                    items: ['Executive team', 'Marketing', 'Product']
                        .map((a) => DropdownMenuItem(value: a, child: Text(a)))
                        .toList(),
                    onChanged: (_) {},
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () {},
                      child: const Text('Save Report'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfile(ThemeData theme) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Account Profile', style: theme.textTheme.titleLarge),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundImage: user?.avatar.isNotEmpty == true
                        ? NetworkImage(user!.avatar)
                        : null,
                    child: user?.avatar.isNotEmpty != true
                        ? Text(user?.name.isNotEmpty == true
                            ? user!.name[0].toUpperCase()
                            : '?',
                            style: const TextStyle(fontSize: 32))
                        : null,
                  ),
                  const SizedBox(height: 16),
                  Text(user?.name ?? 'User',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(user?.email ?? '',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Chip(
                    label: Text(user?.role ?? 'user'),
                    visualDensity: VisualDensity.compact,
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Job Title',
                      border: OutlineInputBorder(),
                    ),
                    controller: TextEditingController(text: user?.jobTitle ?? ''),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    decoration: const InputDecoration(
                      labelText: 'Company',
                      border: OutlineInputBorder(),
                    ),
                    controller: TextEditingController(text: user?.company ?? ''),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () {},
                      child: const Text('Save Changes'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddEventDialog(BuildContext context) {
    final durationController = TextEditingController();
    final revenueController = TextEditingController();
    String selectedSource = 'Organic';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Quick-add Event'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              initialValue: selectedSource,
              decoration: const InputDecoration(
                labelText: 'Source',
                border: OutlineInputBorder(),
              ),
              items: ['Organic', 'Social', 'Referral', 'Direct']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                  .toList(),
              onChanged: (v) => selectedSource = v ?? 'Organic',
            ),
            const SizedBox(height: 12),
            TextField(
              controller: durationController,
              decoration: const InputDecoration(
                labelText: 'Duration (seconds)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: revenueController,
              decoration: const InputDecoration(
                labelText: 'Revenue (optional)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              final dashboard = context.read<DashboardProvider>();
              await dashboard.createEvent(
                source: selectedSource,
                duration: int.tryParse(durationController.text) ?? 60,
                revenue: double.tryParse(revenueController.text) ?? 0,
              );
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Add Event'),
          ),
        ],
      ),
    );
  }
}