import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Server,
  Users,
  Zap,
  RefreshCw,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  GitBranch,
  Timer,
  AlertCircle
} from "lucide-react";
import { logger } from "@/utils/logger";
import { sessionManager } from "@/utils/sessionManager";
import { backupManager } from "@/utils/backupManager";
import { dbOptimizer } from "@/utils/databaseOptimizer";
import { deploymentMetricsCollector, DeploymentMetrics, BuildMetrics } from "@/utils/deploymentMetrics";

interface SystemMetrics {
  timestamp: string;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  errorCount: number;
  responseTime: number;
}

interface HealthStatus {
  database: 'healthy' | 'warning' | 'error';
  session: 'healthy' | 'warning' | 'error';
  performance: 'healthy' | 'warning' | 'error';
  backups: 'healthy' | 'warning' | 'error';
}

interface DeploymentHealthStatus extends HealthStatus {
  deployment: 'healthy' | 'warning' | 'error';
  build: 'healthy' | 'warning' | 'error';
}

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetrics[]>([]);
  const [buildMetrics, setBuildMetrics] = useState<BuildMetrics[]>([]);
  const [healthStatus, setHealthStatus] = useState<DeploymentHealthStatus>({
    database: 'healthy',
    session: 'healthy',
    performance: 'healthy',
    backups: 'healthy',
    deployment: 'healthy',
    build: 'healthy'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Collect system metrics
  const collectMetrics = () => {
    if (typeof window === 'undefined') return;

    const newMetrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      memoryUsage: (performance as any).memory ?
        Math.round(((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100) : 0,
      cpuUsage: 0, // Would need Performance API or external monitoring
      networkRequests: performance.getEntriesByType('navigation').length,
      errorCount: 0, // Would be tracked by error boundary
      responseTime: performance.getEntriesByType('navigation')[0] ?
        (performance.getEntriesByType('navigation')[0] as any).loadEventEnd -
        (performance.getEntriesByType('navigation')[0] as any).fetchStart : 0
    };

    setMetrics(prev => [...prev.slice(-19), newMetrics]); // Keep last 20 metrics
    setLastUpdate(new Date());
  };

  // Check system health
  const checkHealth = async () => {
    try {
      const healthChecks = await Promise.allSettled([
        dbOptimizer.healthCheck(),
        sessionManager.getSessionInfo(),
        // Performance check
        new Promise<{ healthy: boolean; latency: number }>((resolve) => {
          const start = performance.now();
          setTimeout(() => {
            const latency = performance.now() - start;
            resolve({ healthy: latency < 100, latency });
          }, 10);
        }),
        // Backup check
        new Promise<{ hasRecentBackup: boolean; totalBackups: number }>((resolve) => {
          const backups = backupManager.getAvailableBackups();
          const hasRecentBackup = backups.some(backup => {
            const backupDate = new Date(backup.timestamp);
            const daysSinceBackup = (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24);
            return daysSinceBackup < 7; // Has backup within last 7 days
          });
          resolve({ hasRecentBackup, totalBackups: backups.length });
        }),
        // Deployment health check
        await deploymentMetricsCollector.collectDeploymentMetrics(),
        // Build health check
        new Promise<{ healthy: boolean; lastBuildStatus: string }>((resolve) => {
          const buildHistory = deploymentMetricsCollector.getBuildMetricsHistory(1);
          const lastBuild = buildHistory[0];
          const healthy = !lastBuild || lastBuild.status === 'success';
          resolve({ healthy, lastBuildStatus: lastBuild?.status || 'unknown' });
        })
      ]);

      const newHealthStatus: DeploymentHealthStatus = {
        database: healthChecks[0].status === 'fulfilled' && (healthChecks[0].value as any)?.healthy ? 'healthy' : 'error',
        session: healthChecks[1].status === 'fulfilled' && healthChecks[1].value ? 'healthy' : 'warning',
        performance: healthChecks[2].status === 'fulfilled' && (healthChecks[2].value as any)?.healthy ? 'healthy' : 'warning',
        backups: healthChecks[3].status === 'fulfilled' && (healthChecks[3].value as any)?.hasRecentBackup ? 'healthy' : 'warning',
        deployment: healthChecks[4].status === 'fulfilled' ? 'healthy' : 'error',
        build: healthChecks[5].status === 'fulfilled' && (healthChecks[5].value as any)?.healthy ? 'healthy' : 'warning'
      };

      setHealthStatus(newHealthStatus);

      // Update deployment metrics
      if (healthChecks[4].status === 'fulfilled') {
        const newDeploymentMetrics = deploymentMetricsCollector.getMetricsHistory(24);
        setDeploymentMetrics(newDeploymentMetrics);
      }

      // Update build metrics
      const newBuildMetrics = deploymentMetricsCollector.getBuildMetricsHistory(10);
      setBuildMetrics(newBuildMetrics);

    } catch (error) {
      logger.error('Health check failed', { error });
    }
  };

  // Initialize monitoring
  useEffect(() => {
    const initialize = async () => {
      await checkHealth();
      collectMetrics();
      setIsLoading(false);
    };

    initialize();

    // Set up periodic monitoring
    const healthInterval = setInterval(checkHealth, 30000); // Every 30 seconds
    const metricsInterval = setInterval(collectMetrics, 10000); // Every 10 seconds

    return () => {
      clearInterval(healthInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time health and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              checkHealth();
              collectMetrics();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.database)}
              <Badge className={getStatusColor(healthStatus.database)}>
                {healthStatus.database}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.session)}
              <Badge className={getStatusColor(healthStatus.session)}>
                {healthStatus.session}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.performance)}
              <Badge className={getStatusColor(healthStatus.performance)}>
                {healthStatus.performance}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.backups)}
              <Badge className={getStatusColor(healthStatus.backups)}>
                {healthStatus.backups}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployment</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.deployment)}
              <Badge className={getStatusColor(healthStatus.deployment)}>
                {healthStatus.deployment}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Build</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.build)}
              <Badge className={getStatusColor(healthStatus.build)}>
                {healthStatus.build}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="deployment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Deployment Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(deploymentMetrics[deploymentMetrics.length - 1].successRate * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Last 24 hours</p>
                    <Progress
                      value={deploymentMetrics[deploymentMetrics.length - 1].successRate * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-red-600">
                      {Math.round(deploymentMetrics[deploymentMetrics.length - 1].errorRate * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Last 24 hours</p>
                    <Progress
                      value={deploymentMetrics[deploymentMetrics.length - 1].errorRate * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uptime */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {Math.round(deploymentMetrics[deploymentMetrics.length - 1].uptime * 100) / 100}%
                    </div>
                    <p className="text-sm text-gray-600">Availability</p>
                    <Progress
                      value={deploymentMetrics[deploymentMetrics.length - 1].uptime}
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deploymentMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {deploymentMetrics[deploymentMetrics.length - 1].activeUsers}
                    </div>
                    <p className="text-sm text-gray-600">Currently online</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const trends = deploymentMetricsCollector.getPerformanceTrends();
                  return (
                    <>
                      <div className="flex items-center gap-3 p-3 border rounded">
                        {trends.responseTimeTrend === 'improving' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : trends.responseTimeTrend === 'degrading' ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">Response Time</p>
                          <p className={`text-sm capitalize ${
                            trends.responseTimeTrend === 'improving' ? 'text-green-600' :
                            trends.responseTimeTrend === 'degrading' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {trends.responseTimeTrend}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded">
                        {trends.errorRateTrend === 'improving' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : trends.errorRateTrend === 'degrading' ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">Error Rate</p>
                          <p className={`text-sm capitalize ${
                            trends.errorRateTrend === 'improving' ? 'text-green-600' :
                            trends.errorRateTrend === 'degrading' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {trends.errorRateTrend}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded">
                        {trends.memoryTrend === 'improving' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : trends.memoryTrend === 'degrading' ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : (
                          <Activity className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <p className="font-medium">Memory Usage</p>
                          <p className={`text-sm capitalize ${
                            trends.memoryTrend === 'improving' ? 'text-green-600' :
                            trends.memoryTrend === 'degrading' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {trends.memoryTrend}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Heap Usage</span>
                      <span>{metrics[metrics.length - 1].memoryUsage}%</span>
                    </div>
                    <Progress value={metrics[metrics.length - 1].memoryUsage} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {Math.round(metrics[metrics.length - 1].responseTime)}ms
                    </div>
                    <p className="text-sm text-gray-600">Page load time</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="build" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Build Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Build Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {buildMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {Math.round(buildMetrics[buildMetrics.length - 1].duration / 1000)}s
                    </div>
                    <p className="text-sm text-gray-600">Latest build duration</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bundle Size */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Bundle Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                {buildMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {(buildMetrics[buildMetrics.length - 1].bundleSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <p className="text-sm text-gray-600">Total bundle size</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Build Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Build Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {buildMetrics.length > 0 && (
                  <div className="space-y-2">
                    <Badge className={
                      buildMetrics[buildMetrics.length - 1].status === 'success' ? 'bg-green-100 text-green-800' :
                      buildMetrics[buildMetrics.length - 1].status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {buildMetrics[buildMetrics.length - 1].status}
                    </Badge>
                    <p className="text-sm text-gray-600">Latest build result</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Build Assets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Build Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {buildMetrics.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {buildMetrics[buildMetrics.length - 1].assetCount}
                    </div>
                    <p className="text-sm text-gray-600">Total assets generated</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Build History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Build History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {buildMetrics.slice(-10).reverse().map((build, index) => (
                  <div key={build.buildId} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        build.status === 'success' ? 'default' :
                        build.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {build.status}
                      </Badge>
                      <div>
                        <p className="font-medium">{build.buildId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(build.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Math.round(build.duration / 1000)}s</p>
                      <p className="text-sm text-gray-600">
                        {(build.bundleSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logger.getRecentLogs().slice(-10).map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded border">
                    <Badge variant={
                      log.level === 'error' ? 'destructive' :
                      log.level === 'warn' ? 'secondary' : 'default'
                    }>
                      {log.level}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm">{log.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Backup Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => backupManager.createBackup()}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Create Backup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => logger.clearLogs()}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Available Backups</h4>
                  {backupManager.getAvailableBackups().map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{backup.filename}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(backup.timestamp).toLocaleString()} •
                          {(backup.size / 1024).toFixed(1)} KB •
                          {backup.tables.length} tables
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => backupManager.downloadBackup(backup.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(healthStatus).map(([system, status]) => {
                    if (status === 'healthy') return null;

                    return (
                      <div key={system} className="flex items-center gap-3 p-3 border border-yellow-200 bg-yellow-50 rounded">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium capitalize">{system} Issue</p>
                          <p className="text-sm text-gray-600">
                            {system} system is experiencing {status} status
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {Object.values(healthStatus).every(status => status === 'healthy') && (
                    <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">All Systems Healthy</p>
                        <p className="text-sm text-gray-600">
                          All monitoring systems are operating normally
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {deploymentMetricsCollector.getAlertRules().map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-gray-600">{rule.message}</p>
                        </div>
                      </div>
                      <Badge variant={
                        rule.severity === 'critical' ? 'destructive' :
                        rule.severity === 'high' ? 'destructive' :
                        rule.severity === 'medium' ? 'secondary' : 'default'
                      }>
                        {rule.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;