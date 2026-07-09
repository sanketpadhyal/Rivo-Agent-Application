import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {
  Smartphone,
  HardDriveDownload,
  Cpu,
  HardDrive,
  Info,
  CloudDownload,
  Brain,
  Trash2,
} from 'lucide-react-native';
import {
  MODEL_CATALOG,
  formatModelSize,
  getModelDownloadUrl,
  getModelTaskId,
} from '../data/modelCatalog';
import type { ModelCatalogItem } from '../data/modelCatalog';
import ProfessionalAlert from '../components/ProfessionalAlert';
import { getExistingDownloadTasks } from '@kesha-antonov/react-native-background-downloader';
import {
  isModelFileInstalled,
  deleteModelFile,
} from '../utils/modelInstallStatus';
const BYTES_PER_GB = 1000 * 1000 * 1000;
const MARKET_RAM_TIERS = [1, 2, 3, 4, 6, 8, 12, 16, 18, 24, 32];
const DOWNLOAD_STORAGE_RESERVE_BYTES = 200 * 1000 * 1000;
const RECOMMENDATION_STORAGE_RESERVE_BYTES = 1000 * 1000 * 1000;
const getRecommendedMaxPriority = (ramGB: number) => {
  if (ramGB <= 1) return 10;
  if (ramGB <= 8) return 20;
  return 60;
};
const getRecommendedCatalogModel = (
  catalog: ModelCatalogItem[],
  ramGB: number,
  freeDisk: number,
) => {
  const recommendedMaxPriority = getRecommendedMaxPriority(ramGB);
  const smoothCandidates = catalog.filter(
    model =>
      ramGB >= model.minRam &&
      freeDisk >= model.byteSize + RECOMMENDATION_STORAGE_RESERVE_BYTES,
  );
  return (
    smoothCandidates
      .filter(model => model.priority <= recommendedMaxPriority)
      .sort((a, b) => b.priority - a.priority)[0] ??
    smoothCandidates.sort((a, b) => a.priority - b.priority)[0] ??
    catalog
      .filter(
        model =>
          ramGB >= model.minRam &&
          freeDisk >= model.byteSize + DOWNLOAD_STORAGE_RESERVE_BYTES,
      )
      .sort((a, b) => a.priority - b.priority)[0]
  );
};
const normalizeWhitespace = (value?: string | null) =>
  value?.replace(/\s+/g, ' ').trim() ?? '';
const getDisplayDeviceName = async () => {
  const [deviceName, rawModel, isEmulator] = await Promise.all([
    DeviceInfo.getDeviceName().catch(() => ''),
    Promise.resolve(DeviceInfo.getModel()).catch(() => ''),
    DeviceInfo.isEmulator().catch(() => false),
  ]);
  if (isEmulator) {
    return 'Android Virtual Device';
  }
  return (
    normalizeWhitespace(deviceName) ||
    normalizeWhitespace(rawModel) ||
    'This device'
  );
};
const getMarketedRamGB = (bytes: number) => {
  const decimalRam = bytes / BYTES_PER_GB;
  const nearestTier = MARKET_RAM_TIERS.reduce(
    (nearest, tier) =>
      Math.abs(tier - decimalRam) < Math.abs(nearest - decimalRam)
        ? tier
        : nearest,
    MARKET_RAM_TIERS[0],
  );
  if (Math.abs(nearestTier - decimalRam) / nearestTier <= 0.18) {
    return nearestTier;
  }
  return Math.max(1, Math.round(decimalRam));
};
const formatStorageGB = (bytes: number) => {
  const value = bytes / BYTES_PER_GB;
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1);
};
interface Props {
  onComplete: () => void;
  onModelReady?: () => void;
}
const ModelSkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);
  return (
    <Animated.View
      style={[
        styles.modelCard,
        {
          opacity: pulseAnim,
        },
      ]}
    >
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonDesc} />
      <View style={styles.skeletonFooter} />
    </Animated.View>
  );
};
const OnboardingScreen: React.FC<Props> = ({ onComplete, onModelReady }) => {
  const insets = useSafeAreaInsets();
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [deviceSpecs, setDeviceSpecs] = useState({
    modelName: 'Detecting...',
    ramGB: 0,
    ramLabel: 'Detecting',
    freeStorageGB: 0,
    freeStorageLabel: 'Detecting',
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    iconName: 'alert-circle' as 'alert-circle' | 'hard-drive' | 'cpu',
  });
  const [deleteConfirmModel, setDeleteConfirmModel] = useState<any | null>(
    null,
  );
  const selectedModelData = models.find(model => model.id === selectedModel);
  const canDownloadSelected = Boolean(selectedModelData?.isSupported);
  const selectedModelIsDownloading = Boolean(
    selectedModelData?.hasActiveDownload,
  );
  const selectedModelIsDownloaded = Boolean(selectedModelData?.isDownloaded);
  const [swipeWidth, setSwipeWidth] = useState(0);
  const swipeX = useRef(new Animated.Value(0)).current;
  const swipeConfirmedRef = useRef(false);
  const maxSwipeX = Math.max(swipeWidth - 58, 0);
  const loadData = React.useCallback(async () => {
    try {
      const [totalMemory, freeDisk, deviceModel] = await Promise.all([
        DeviceInfo.getTotalMemory(),
        DeviceInfo.getFreeDiskStorage(),
        getDisplayDeviceName(),
      ]);
      const ramGB = getMarketedRamGB(totalMemory);
      const freeStorageGB = freeDisk / BYTES_PER_GB;
      setDeviceSpecs({
        modelName: deviceModel,
        ramGB,
        ramLabel: `${ramGB}GB RAM`,
        freeStorageGB,
        freeStorageLabel: `${formatStorageGB(freeDisk)}GB Free`,
      });
      const compatibleCatalog = [...MODEL_CATALOG].sort(
        (a, b) => a.priority - b.priority,
      );
      const existingTasks = await getExistingDownloadTasks();
      const activeDownloadStates = ['PENDING', 'DOWNLOADING', 'PAUSED'];
      const recommendedCatalogModel = getRecommendedCatalogModel(
        compatibleCatalog,
        ramGB,
        freeDisk,
      );
      const fetchedModels: any[] = [];
      for (const repo of compatibleCatalog) {
        const activeTask = existingTasks.find(
          task =>
            task.id === getModelTaskId(repo) &&
            activeDownloadStates.includes(task.state),
        );
        const hasActiveDownload = Boolean(activeTask);
        const ramFits = ramGB >= repo.minRam;
        const storageFits =
          freeDisk >= repo.byteSize + DOWNLOAD_STORAGE_RESERVE_BYTES;
        const isDownloaded = await isModelFileInstalled(repo, repo.fileName);
        const isSupported =
          isDownloaded || hasActiveDownload || (ramFits && storageFits);
        const activeBytesTotal = activeTask?.bytesTotal || repo.byteSize;
        const activePercent =
          activeTask && activeBytesTotal > 0
            ? Math.floor((activeTask.bytesDownloaded / activeBytesTotal) * 100)
            : 0;
        try {
          const res = await fetch(
            `https://huggingface.co/api/models/${repo.id}`,
          );
          const data = await res.json();
          fetchedModels.push({
            id: repo.id,
            name: repo.name,
            logo: repo.logo,
            description: repo.desc,
            size: formatModelSize(repo.byteSize),
            fileName: repo.fileName,
            byteSize: repo.byteSize,
            minRam: repo.minRam,
            ramFits,
            storageFits,
            isSupported,
            isDownloaded,
            hasActiveDownload,
            activeDownloadState: activeTask?.state,
            activePercent,
            downloadUrl: getModelDownloadUrl(repo),
            downloads: data.downloads || 0,
            tag: isDownloaded
              ? 'DOWNLOADED'
              : hasActiveDownload
              ? 'CONTINUE DOWNLOADING'
              : repo.id === recommendedCatalogModel?.id
              ? 'RECOMMENDED'
              : null,
          });
        } catch {
          fetchedModels.push({
            id: repo.id,
            name: repo.name,
            logo: repo.logo,
            description: repo.desc,
            size: formatModelSize(repo.byteSize),
            fileName: repo.fileName,
            byteSize: repo.byteSize,
            minRam: repo.minRam,
            ramFits,
            storageFits,
            isSupported,
            isDownloaded,
            hasActiveDownload,
            activeDownloadState: activeTask?.state,
            activePercent,
            downloadUrl: getModelDownloadUrl(repo),
            downloads: 0,
            tag: isDownloaded
              ? 'DOWNLOADED'
              : hasActiveDownload
              ? 'CONTINUE DOWNLOADING'
              : repo.id === recommendedCatalogModel?.id
              ? 'RECOMMENDED'
              : null,
          });
        }
      }
      setModels(fetchedModels);
      const firstActiveDownload = fetchedModels.find(
        model => model.hasActiveDownload,
      );
      const firstDownloaded = fetchedModels.find(model => model.isDownloaded);
      const recommendedModel = fetchedModels.find(
        model => model.id === recommendedCatalogModel?.id,
      );
      const firstDownloadable = fetchedModels.find(model => model.isSupported);
      setSelectedModel(current => {
        if (current && fetchedModels.some(m => m.id === current)) {
          return current;
        }
        if (firstActiveDownload) return firstActiveDownload.id;
        if (firstDownloaded) return firstDownloaded.id;
        if (recommendedModel) return recommendedModel.id;
        if (firstDownloadable) return firstDownloadable.id;
        return '';
      });
    } catch (e) {
      console.error(e);
    }
  }, []);
  useEffect(() => {
    swipeConfirmedRef.current = false;
    Animated.spring(swipeX, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      overshootClamping: true,
      useNativeDriver: true,
    }).start();
  }, [canDownloadSelected, loading, selectedModel, swipeX]);
  useEffect(() => {
    setLoading(true);
    loadData().finally(() => {
      setTimeout(() => setLoading(false), 1200);
    });
  }, [loadData]);
  useEffect(() => {
    const handleBack = () => {
      if (alert.visible) {
        closeAlert();
        return true;
      }
      if (deleteConfirmModel) {
        setDeleteConfirmModel(null);
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );
    return () => subscription.remove();
  }, [alert.visible, deleteConfirmModel]);
  const handleDownloadAndContinue = async () => {
    if (!canDownloadSelected) {
      return;
    }
    try {
      const model = models.find(m => m.id === selectedModel);
      if (model) {
        await AsyncStorage.setItem('selectedModelId', model.id);
        await AsyncStorage.setItem('selectedModelName', model.name);
        await AsyncStorage.setItem('selectedModelFileName', model.fileName);
        await AsyncStorage.setItem(
          'selectedModelSizeBytes',
          String(model.byteSize),
        );
        await AsyncStorage.setItem(
          'selectedModelDownloadUrl',
          model.downloadUrl,
        );
        if (model.isDownloaded && onModelReady) {
          onModelReady();
          return;
        }
      }
      onComplete();
    } catch (e) {
      console.error('Error saving onboarding data:', e);
      onComplete();
    }
  };
  const closeAlert = () => {
    setAlert(current => ({
      ...current,
      visible: false,
    }));
  };
  const handleModelPress = (model: any) => {
    if (model.hasActiveDownload) {
      setSelectedModel(model.id);
      return;
    }
    if (!model.ramFits) {
      setAlert({
        visible: true,
        title: 'Model Not Supported',
        message: `${model.name} needs at least ${model.minRam}GB RAM. This device reports ${deviceSpecs.ramLabel}, so it may crash or run too slowly. Choose a smaller optimized model for this device.`,
        iconName: 'cpu',
      });
      return;
    }
    if (!model.storageFits) {
      const freeGB = `${deviceSpecs.freeStorageLabel}`;
      setAlert({
        visible: true,
        title: 'Storage Not Enough',
        message: `${model.name} is a real ${model.size} download. Your device currently has ${freeGB} free, so this model cannot be downloaded completely. Free up storage or choose a smaller supported model.`,
        iconName: 'hard-drive',
      });
      return;
    }
    setSelectedModel(model.id);
  };
  const resetSwipe = () => {
    swipeConfirmedRef.current = false;
    Animated.spring(swipeX, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      overshootClamping: true,
      useNativeDriver: true,
    }).start();
  };
  const completeSwipe = () => {
    if (swipeConfirmedRef.current) {
      return;
    }
    swipeConfirmedRef.current = true;
    Animated.timing(swipeX, {
      toValue: maxSwipeX,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      handleDownloadAndContinue();
      resetSwipe();
    });
  };
  const swipeResponder = PanResponder.create({
    onStartShouldSetPanResponder: () =>
      canDownloadSelected && !loading && maxSwipeX > 0,
    onMoveShouldSetPanResponder: (_, gesture) =>
      canDownloadSelected &&
      !loading &&
      maxSwipeX > 0 &&
      Math.abs(gesture.dx) > 4,
    onPanResponderMove: (_, gesture) => {
      const nextValue = Math.max(0, Math.min(gesture.dx, maxSwipeX));
      swipeX.setValue(nextValue);
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx >= maxSwipeX * 0.7) {
        completeSwipe();
        return;
      }
      resetSwipe();
    },
    onPanResponderTerminate: resetSwipe,
  });
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            marginTop: insets.top + 14,
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Rivo Agent</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Select AI Model</Text>
          <Text style={styles.subtitle}>
            Choose the neural network model that will run locally on your
            device.
          </Text>
          <Text style={styles.huggingFaceCredit}>
            Models sourced from Hugging Face 🤗
          </Text>
          <Text style={styles.recommendationHint}>
            Please download the recommended one. It is the best for your device.
          </Text>

          <View style={styles.deviceInfoContainer}>
            <View style={styles.deviceInfoIcon}>
              <Smartphone color="#0A84FF" size={20} strokeWidth={2.5} />
            </View>
            <View style={styles.deviceInfoTextContainer}>
              <Text style={styles.deviceInfoTitle}>Optimal Hardware</Text>
              <Text style={styles.deviceInfoText}>{deviceSpecs.modelName}</Text>

              <View style={styles.specsRow}>
                <View style={styles.specBadge}>
                  <Cpu
                    color="#34C759"
                    size={12}
                    strokeWidth={2.5}
                    style={styles.specBadgeIconSpacing}
                  />
                  <Text style={styles.specBadgeText}>
                    {deviceSpecs.ramLabel}
                  </Text>
                </View>
                <View style={styles.specBadge}>
                  <HardDrive
                    color="#34C759"
                    size={12}
                    strokeWidth={2.5}
                    style={styles.specBadgeIconSpacing}
                  />
                  <Text style={styles.specBadgeText}>
                    {deviceSpecs.freeStorageLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.adviceContainer}>
                <Info
                  color="#8E8E93"
                  size={10}
                  strokeWidth={2.5}
                  style={{
                    marginRight: 4,
                  }}
                />
                <Text style={styles.adviceText}>
                  Advice: Keep 10 GB storage empty for fast processing.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Models</Text>
              <Text style={styles.sectionSubtitle}>
                Shown models are optimized for your device and fetched by device
                specs.
              </Text>
            </View>
            {loading ? (
              <>
                <ModelSkeleton />
                <ModelSkeleton />
                <ModelSkeleton />
              </>
            ) : (
              models.map(model => {
                const isSelected = selectedModel === model.id;
                return (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelCard,
                      !model.isSupported && styles.modelCardDisabled,
                      model.hasActiveDownload && styles.modelCardDownloading,
                      isSelected && styles.modelCardSelected,
                      isSelected &&
                        model.hasActiveDownload &&
                        styles.modelCardDownloadingSelected,
                      model.isDownloaded && styles.modelCardDownloaded,
                      isSelected &&
                        model.isDownloaded &&
                        styles.modelCardDownloadedSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleModelPress(model)}
                  >
                    <View style={styles.modelHeader}>
                      <View style={styles.modelTitleRow}>
                        <Brain
                          color="#FFFFFF"
                          size={20}
                          strokeWidth={2.5}
                          style={{
                            marginRight: 8,
                          }}
                        />
                        <Text
                          style={[
                            styles.modelName,
                            isSelected && styles.modelNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {model.name}
                        </Text>
                      </View>
                      {isSelected && model.isDownloaded ? (
                        <TouchableOpacity
                          style={styles.deleteModelBtn}
                          activeOpacity={0.76}
                          onPress={e => {
                            e.stopPropagation();
                            setDeleteConfirmModel(model);
                          }}
                        >
                          <Trash2 color="#FFFFFF" size={14} strokeWidth={2.5} />
                        </TouchableOpacity>
                      ) : model.tag ? (
                        <View
                          style={[
                            styles.tagContainer,
                            model.hasActiveDownload &&
                              styles.downloadingTagContainer,
                            model.isDownloaded && styles.downloadedTagContainer,
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              model.hasActiveDownload &&
                                styles.downloadingTagText,
                              model.isDownloaded && styles.downloadedTagText,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.72}
                          >
                            {model.tag}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.modelDesc}>{model.description}</Text>
                    <View style={styles.modelFooter}>
                      <View style={styles.modelSizeGroup}>
                        <HardDriveDownload
                          color="#34C759"
                          size={16}
                          strokeWidth={2.5}
                          style={{
                            marginRight: 6,
                          }}
                        />
                        <Text style={styles.modelSize} numberOfLines={1}>
                          {model.size}
                        </Text>
                      </View>
                      <Text style={styles.modelDownloads}>
                        {model.minRam > 0
                          ? `${model.minRam}GB+ RAM`
                          : 'All RAM'}
                      </Text>
                      {!model.ramFits && (
                        <Text style={styles.modelDownloads}>Unsupported</Text>
                      )}
                      {model.ramFits &&
                        !model.storageFits &&
                        !model.isDownloaded && (
                          <Text style={styles.modelDownloads}>
                            Need storage
                          </Text>
                        )}
                      {model.hasActiveDownload && (
                        <Text style={styles.downloadingMeta}>
                          {model.activePercent > 0
                            ? `${model.activePercent}%`
                            : 'Active'}
                        </Text>
                      )}
                      {model.downloads > 0 && (
                        <Text style={styles.modelDownloads}>
                          ↓ {(model.downloads / 1000).toFixed(1)}k
                        </Text>
                      )}
                      <View
                        style={[
                          styles.radio,
                          isSelected && styles.radioSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom + 16, 32),
          },
        ]}
      >
        <View
          style={[
            styles.swipeTrack,
            selectedModelIsDownloading && styles.swipeTrackDownloading,
            (loading || !canDownloadSelected) && styles.swipeTrackDisabled,
          ]}
          onLayout={event => setSwipeWidth(event.nativeEvent.layout.width)}
          {...swipeResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.swipeThumb,
              {
                transform: [
                  {
                    translateX: swipeX,
                  },
                ],
              },
            ]}
          >
            <CloudDownload
              color={canDownloadSelected && !loading ? '#FFFFFF' : '#8E8E93'}
              size={22}
              strokeWidth={2.5}
            />
          </Animated.View>
          <View pointerEvents="none" style={styles.swipeTextLayer}>
            <Text
              style={[
                styles.swipeText,
                (loading || !canDownloadSelected) && styles.swipeTextDisabled,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {loading
                ? 'Fetching...'
                : selectedModelIsDownloading
                ? 'Swipe to Continue Downloading'
                : selectedModelIsDownloaded
                ? 'Swipe to Launch Engine'
                : canDownloadSelected
                ? 'Swipe to Download'
                : 'Free Storage Needed'}
            </Text>
          </View>
        </View>
      </View>

      <ProfessionalAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        iconName={alert.iconName}
        onClose={closeAlert}
      />

      <ProfessionalAlert
        visible={Boolean(deleteConfirmModel)}
        title="Delete Model File?"
        message={`Are you sure you want to delete ${deleteConfirmModel?.name} from your local storage? This will free up ${deleteConfirmModel?.size} space.`}
        iconName="trash-2"
        isDestructive
        confirmLabel="Yes, Delete"
        cancelLabel="No"
        onClose={() => setDeleteConfirmModel(null)}
        onConfirm={async () => {
          if (deleteConfirmModel) {
            const modelToDelete = deleteConfirmModel;
            setDeleteConfirmModel(null);
            setLoading(true);
            try {
              await deleteModelFile(modelToDelete.fileName);
              const currentSelected = await AsyncStorage.getItem(
                'selectedModelId',
              );
              if (currentSelected === modelToDelete.id) {
                await AsyncStorage.multiRemove([
                  'selectedModelId',
                  'selectedModelName',
                  'selectedModelFileName',
                  'selectedModelSizeBytes',
                  'selectedModelDownloadUrl',
                  'downloadedModelId',
                  'downloadedModelName',
                  'downloadedModelFileName',
                  'downloadedModelSizeBytes',
                  'modelDownloadComplete',
                ]);
              }
              await loadData();
            } catch (err) {
              console.warn('OnboardingScreen: failed to delete model:', err);
            } finally {
              setLoading(false);
            }
          }
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 34,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    color: '#FFFFFF',
    fontFamily: 'SF-Pro-Rounded-Bold',
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'SF-Pro-Rounded-Semibold',
    lineHeight: 20,
    marginBottom: 8,
  },
  huggingFaceCredit: {
    fontSize: 12,
    color: '#34C759',
    fontFamily: 'SF-Pro-Rounded-Semibold',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendationHint: {
    color: '#D4D4D8',
    fontSize: 13,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    lineHeight: 18,
    marginBottom: 18,
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#15161A',
    padding: 14,
    borderRadius: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  deviceInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2A2A2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceInfoTitle: {
    color: '#8E8E93',
    fontSize: 11,
    fontFamily: 'SF-Pro-Rounded-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  deviceInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'SF-Pro-Rounded-Heavy',
    marginBottom: 8,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  specBadgeIconSpacing: {
    marginRight: 4,
  },
  specBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  adviceText: {
    color: '#8E8E93',
    fontSize: 10,
    fontFamily: 'SF-Pro-Rounded-Semibold',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  listContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    marginTop: 4,
  },
  modelCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  modelCardSelected: {
    borderColor: '#0A84FF',
    backgroundColor: '#162235',
  },
  modelCardDownloading: {
    borderColor: 'rgba(255, 214, 10, 0.4)',
    backgroundColor: '#1C1C1E',
  },
  modelCardDownloadingSelected: {
    borderColor: '#FFD60A',
    backgroundColor: '#262214',
  },
  modelCardDisabled: {
    opacity: 0.45,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    columnGap: 8,
  },
  modelTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  modelName: {
    flex: 1,
    minWidth: 0,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  modelNameSelected: {
    color: '#FFFFFF',
  },
  tagContainer: {
    maxWidth: '52%',
    flexShrink: 1,
    backgroundColor: '#152219',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#34C759',
    fontSize: 9,
    fontFamily: 'SF-Pro-Rounded-Bold',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  downloadingTagContainer: {
    maxWidth: '58%',
    backgroundColor: '#2A2514',
  },
  downloadingTagText: {
    color: '#FFD60A',
  },
  modelDesc: {
    color: '#8E8E93',
    fontSize: 13,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    lineHeight: 18,
    marginBottom: 12,
  },
  modelFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 8,
  },
  modelSizeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  modelSize: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  radioSelected: {
    borderColor: '#0A84FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0A84FF',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  swipeTrack: {
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  swipeTrackDownloading: {
    backgroundColor: '#FFD60A',
  },
  swipeTrackDisabled: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  swipeTextLayer: {
    position: 'absolute',
    top: 0,
    right: 20,
    bottom: 0,
    left: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: 'SF-Pro-Rounded-Bold',
    textAlign: 'center',
    width: '100%',
    lineHeight: 20,
  },
  swipeTextDisabled: {
    color: '#8E8E93',
  },
  swipeThumb: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  skeletonTitle: {
    width: 120,
    height: 20,
    backgroundColor: '#3A3A3E',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDesc: {
    width: '100%',
    height: 16,
    backgroundColor: '#2A2A2E',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonFooter: {
    width: 80,
    height: 16,
    backgroundColor: '#2A2A2E',
    borderRadius: 4,
  },
  modelDownloads: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'SF-Pro-Rounded-Semibold',
    marginRight: 12,
  },
  downloadingMeta: {
    color: '#FFD60A',
    fontSize: 12,
    fontFamily: 'SF-Pro-Rounded-Bold',
    marginRight: 12,
  },
  deleteModelBtn: {
    width: 32,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FF453A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadedTagContainer: {
    backgroundColor: '#152219',
    borderColor: '#1E4D2B',
  },
  downloadedTagText: {
    color: '#34C759',
  },
  modelCardDownloaded: {
    borderColor: 'rgba(52, 199, 89, 0.25)',
    backgroundColor: '#1C1C1E',
  },
  modelCardDownloadedSelected: {
    borderColor: '#34C759',
    backgroundColor: '#122515',
    shadowColor: '#34C759',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
});
export default OnboardingScreen;
