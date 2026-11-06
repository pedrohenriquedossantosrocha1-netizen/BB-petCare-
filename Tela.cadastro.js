import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const mapCenter = {
  latitude: -15.7939,
  longitude: -47.8828,
  latitudeDelta: 0.075,
  longitudeDelta: 0.055,
};

const distanceBetween = (latitudeA, longitudeA, latitudeB, longitudeB) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const sampleClinics = [
  {
    id: 'petvita',
    name: 'Clínica PetVita',
    specialty: 'Clínica Geral',
    address: 'CLS 308, Asa Sul, Brasília - DF',
    rating: 4.9,
    emergency: false,
    latitude: -15.8152,
    longitude: -47.8952,
  },
  {
    id: 'vet-central',
    name: 'Hospital Vet. Central',
    specialty: 'Emergência 24h',
    address: 'SHLS 716, Asa Sul, Brasília - DF',
    rating: 4.7,
    emergency: true,
    latitude: -15.8194,
    longitude: -47.9291,
  },
  {
    id: 'felipe-rocha',
    name: 'Dr. Felipe Rocha',
    specialty: 'Dermatologia',
    address: 'CLN 116, Asa Norte, Brasília - DF',
    rating: 4.8,
    emergency: false,
    latitude: -15.7624,
    longitude: -47.8875,
  },
  {
    id: 'amigo-pet',
    name: 'Clínica Amigo Pet',
    specialty: 'Exames e consultas',
    address: 'CLS 210, Asa Sul, Brasília - DF',
    rating: 4.6,
    emergency: false,
    latitude: -15.8078,
    longitude: -47.8922,
  },
  {
    id: 'plantao-animal',
    name: 'Plantão Animal',
    specialty: 'Emergência 24h',
    address: 'CLN 407, Asa Norte, Brasília - DF',
    rating: 4.8,
    emergency: true,
    latitude: -15.7593,
    longitude: -47.8871,
  },
];

const savedClinicsKey = '@bb-petcare/user-clinics';

function ClinicCard({ clinic, isFavorite, onFavorite, onShare, onShowOnMap }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.clinicIcon}>
          <Text style={styles.pinSmall}>⌖</Text>
        </View>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={styles.specialty}>{clinic.specialty}</Text>
          {!!clinic.address && <Text style={styles.clinicAddress}>{clinic.address}</Text>}
          <View style={styles.details}>
            {clinic.rating != null && (
              <>
                <Text style={styles.rating}>★</Text>
                <Text style={styles.detailText}>{clinic.rating.toFixed(1)}</Text>
                <Text style={styles.detailSeparator}>·</Text>
              </>
            )}
            <Text style={styles.detailText}>⌖ {clinic.distance.toFixed(1)} km</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onPress={() => onFavorite(clinic.id)}
          style={styles.favoriteButton}
        >
          <Text style={[styles.heart, isFavorite && styles.heartActive]}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onShare(clinic)}
          style={styles.shareButton}
        >
          <Text style={styles.shareIcon}>↗</Text>
          <Text style={styles.shareText}>Compartilhar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => onShowOnMap(clinic)}
          style={styles.routeButton}
        >
          <Text style={styles.routeIcon}>↝</Text>
          <Text style={styles.routeText}>Ver rota</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddClinicModal({ visible, onClose, onSave }) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [emergency, setEmergency] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setSpecialty('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setEmergency(false);
    setError('');
  };

  const closeForm = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const submit = async () => {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const hasLatitude = latitude.trim().length > 0;
    const hasLongitude = longitude.trim().length > 0;

    if (!trimmedName) {
      setError('Digite o nome da clínica.');
      return;
    }

    if (hasLatitude !== hasLongitude) {
      setError('Preencha latitude e longitude juntas, ou use o endereço.');
      return;
    }

    if (!trimmedAddress && !hasLatitude) {
      setError('Informe um endereço ou as coordenadas para marcar a clínica no mapa.');
      return;
    }

    if (hasLatitude) {
      const parsedLatitude = Number(latitude);
      const parsedLongitude = Number(longitude);
      if (
        !Number.isFinite(parsedLatitude) ||
        !Number.isFinite(parsedLongitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90 ||
        parsedLongitude < -180 ||
        parsedLongitude > 180
      ) {
        setError('Confira as coordenadas. Latitude vai de -90 a 90 e longitude de -180 a 180.');
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        name: trimmedName,
        specialty: specialty.trim() || 'Veterinária',
        address: trimmedAddress,
        latitude: hasLatitude ? Number(latitude) : null,
        longitude: hasLongitude ? Number(longitude) : null,
        emergency,
      });
      resetForm();
      onClose();
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar a clínica.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={closeForm}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <ScrollView
          contentContainerStyle={styles.modalScrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formTitle}>Adicionar clínica</Text>
              <Text style={styles.formSubtitle}>Cadastre um local para aparecer no mapa.</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Fechar cadastro"
              disabled={saving}
              onPress={closeForm}
              style={styles.formCloseButton}
            >
              <Text style={styles.formCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Nome da clínica *</Text>
          <TextInput
            autoCapitalize="words"
            editable={!saving}
            onChangeText={setName}
            placeholder="Ex.: Clínica VIP"
            placeholderTextColor="#9aa1ab"
            style={styles.formInput}
            value={name}
          />

          <Text style={styles.inputLabel}>Especialidade</Text>
          <TextInput
            autoCapitalize="sentences"
            editable={!saving}
            onChangeText={setSpecialty}
            placeholder="Ex.: Clínica geral"
            placeholderTextColor="#9aa1ab"
            style={styles.formInput}
            value={specialty}
          />

          <Text style={styles.inputLabel}>Endereço ou coordenadas *</Text>
          <TextInput
            autoCapitalize="words"
            editable={!saving}
            onChangeText={setAddress}
            placeholder="Endereço em Brasília - DF"
            placeholderTextColor="#9aa1ab"
            style={styles.formInput}
            value={address}
          />
          <Text style={styles.coordinateHint}>
            O endereço é localizado pelo OpenStreetMap e precisa de internet; coordenadas podem ser usadas sem essa busca.
          </Text>
          <Text style={styles.orLabel}>Ou informe as coordenadas do Google Maps:</Text>
          <Text style={styles.coordinateHint}>
            No Google Maps, toque e segure o local para ver latitude e longitude.
          </Text>
          <View style={styles.coordinateFields}>
            <TextInput
              editable={!saving}
              keyboardType="numbers-and-punctuation"
              onChangeText={setLatitude}
              placeholder="Latitude"
              placeholderTextColor="#9aa1ab"
              style={[styles.formInput, styles.coordinateInput]}
              value={latitude}
            />
            <TextInput
              editable={!saving}
              keyboardType="numbers-and-punctuation"
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor="#9aa1ab"
              style={[styles.formInput, styles.coordinateInput]}
              value={longitude}
            />
          </View>

          <TouchableOpacity
            accessibilityRole="checkbox"
            accessibilityState={{ checked: emergency }}
            onPress={() => setEmergency((value) => !value)}
            style={styles.emergencyOption}
          >
            <View style={[styles.checkbox, emergency && styles.checkboxChecked]}>
              {emergency && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.emergencyLabel}>Atendimento de emergência 24h</Text>
          </TouchableOpacity>

          {!!error && <Text style={styles.formError}>{error}</Text>}

          <TouchableOpacity
            accessibilityRole="button"
            disabled={saving}
            onPress={submit}
            style={[styles.saveClinicButton, saving && styles.saveClinicButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveClinicText}>Salvar clínica</Text>
            )}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function App() {
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('Início');
  const [region, setRegion] = useState(mapCenter);
  const [route, setRoute] = useState(null);
  const [routeStatus, setRouteStatus] = useState('');
  const [userClinics, setUserClinics] = useState([]);
  const [clinicsLoaded, setClinicsLoaded] = useState(false);
  const [addClinicVisible, setAddClinicVisible] = useState(false);
  const mapRef = useRef(null);
  const routeRequestRef = useRef(null);

  React.useEffect(() => {
    let active = true;

    const loadClinics = async () => {
      try {
        const storedClinics = await AsyncStorage.getItem(savedClinicsKey);
        const parsedClinics = storedClinics ? JSON.parse(storedClinics) : [];
        if (!Array.isArray(parsedClinics)) {
          throw new Error('Os dados salvos das clínicas estão inválidos.');
        }
        if (active) {
          setUserClinics(parsedClinics);
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'Não foi possível carregar as clínicas',
            error.message || 'Confira o armazenamento do aparelho e tente novamente.',
          );
        }
      } finally {
        if (active) setClinicsLoaded(true);
      }
    };

    loadClinics();
    return () => {
      active = false;
    };
  }, []);

  const clinics = useMemo(() => [...sampleClinics, ...userClinics], [userClinics]);

  const clinicsNearRegion = useMemo(
    () =>
      clinics.map((clinic) => ({
        ...clinic,
        distance: distanceBetween(
          region.latitude,
          region.longitude,
          clinic.latitude,
          clinic.longitude,
        ),
      })),
    [region.latitude, region.longitude],
  );

  const visibleClinics = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = clinicsNearRegion.filter((clinic) => {
      const matchesSearch = `${clinic.name} ${clinic.specialty} ${clinic.address || ''}`
        .toLocaleLowerCase()
        .includes(query);
      return matchesSearch && (!emergencyOnly || clinic.emergency);
    });

    return sortAlphabetically
      ? [...result].sort((a, b) => a.name.localeCompare(b.name))
      : [...result].sort((a, b) => a.distance - b.distance);
  }, [clinicsNearRegion, search, emergencyOnly, sortAlphabetically]);

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    );
  };

  const shareClinic = async (clinic) => {
    await Share.share({
      message: `${clinic.name} — ${clinic.specialty}.${clinic.address ? ` ${clinic.address}.` : ''}`,
    });
  };

  const addClinic = async (clinicDetails) => {
    let latitude = clinicDetails.latitude;
    let longitude = clinicDetails.longitude;

    if (latitude == null && clinicDetails.address) {
      const addressInBrasilia = `${clinicDetails.address}, Brasília, Distrito Federal, Brasil`;
      const brasiliaBounds = '-48.3,-15.45,-47.25,-16.1';
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&viewbox=${brasiliaBounds}&bounded=1&q=${encodeURIComponent(addressInBrasilia)}`;
      const response = await fetch(geocodingUrl, {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'BB-PetCare/1.0',
        },
      });
      if (!response.ok) {
        throw new Error('Não foi possível localizar o endereço. Tente novamente ou use coordenadas.');
      }

      const matches = await response.json();
      const firstMatch = matches[0];
      if (!firstMatch) {
        throw new Error('Endereço não encontrado. Confira ou use as coordenadas do Google Maps.');
      }
      latitude = Number(firstMatch.lat);
      longitude = Number(firstMatch.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('O endereço retornou coordenadas inválidas.');
      }
    }

    const newClinic = {
      id: `user-${Date.now()}`,
      name: clinicDetails.name,
      specialty: clinicDetails.specialty,
      address: clinicDetails.address,
      rating: null,
      emergency: clinicDetails.emergency,
      latitude,
      longitude,
    };
    const updatedClinics = [...userClinics, newClinic];
    await AsyncStorage.setItem(savedClinicsKey, JSON.stringify(updatedClinics));
    setUserClinics(updatedClinics);
    setSearch('');
    setEmergencyOnly(false);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 },
      600,
    );
  };

  const clearRoute = () => {
    routeRequestRef.current?.abort();
    routeRequestRef.current = null;
    setRoute(null);
    setRouteStatus('');
  };

  const openRouteInMaps = async () => {
    if (!route) return;

    const destination = `${route.destination.latitude},${route.destination.longitude}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    const nativeMapsUrl =
      Platform.OS === 'android'
        ? `google.navigation:q=${encodeURIComponent(destination)}&mode=d`
        : Platform.OS === 'ios'
          ? `comgooglemaps://?daddr=${encodeURIComponent(destination)}&directionsmode=driving`
          : googleMapsUrl;

    try {
      await Linking.openURL(nativeMapsUrl);
    } catch {
      try {
        await Linking.openURL(googleMapsUrl);
      } catch {
        setRouteStatus('Não foi possível abrir o aplicativo de mapas neste dispositivo.');
      }
    }
  };

  const showClinicOnMap = async (clinic) => {
    routeRequestRef.current?.abort();
    const controller = new AbortController();
    routeRequestRef.current = controller;
    setRoute(null);
    setRouteStatus(`Calculando rota para ${clinic.name}...`);

    mapRef.current?.animateToRegion(
      {
        latitude: (mapCenter.latitude + clinic.latitude) / 2,
        longitude: (mapCenter.longitude + clinic.longitude) / 2,
        latitudeDelta: Math.max(Math.abs(mapCenter.latitude - clinic.latitude) * 2.5, 0.012),
        longitudeDelta: Math.max(Math.abs(mapCenter.longitude - clinic.longitude) * 2.5, 0.012),
      },
      600,
    );

    try {
      const coordinates = `${mapCenter.longitude},${mapCenter.latitude};${clinic.longitude},${clinic.latitude}`;
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`O serviço de rotas respondeu com erro (${response.status}).`);
      }

      const data = await response.json();
      const result = data.routes?.[0];
      const routeCoordinates = result?.geometry?.coordinates;

      if (data.code !== 'Ok' || !Array.isArray(routeCoordinates) || routeCoordinates.length < 2) {
        throw new Error('Não foi possível encontrar uma rota para esta clínica.');
      }

      const points = routeCoordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
      setRoute({
        clinicId: clinic.id,
        clinicName: clinic.name,
        destination: {
          latitude: clinic.latitude,
          longitude: clinic.longitude,
        },
        coordinates: points,
        distance: result.distance,
        duration: result.duration,
      });
      setRouteStatus('');
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 65, right: 45, bottom: 65, left: 45 },
        animated: true,
      });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setRouteStatus(error.message || 'Não foi possível calcular a rota. Tente novamente.');
      }
    } finally {
      if (routeRequestRef.current === controller) {
        routeRequestRef.current = null;
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.mapSection}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={mapCenter}
          onRegionChangeComplete={setRegion}
          mapType="none"
          showsCompass={false}
          showsIndoors={false}
          toolbarEnabled={false}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            tileSize={256}
            shouldReplaceMapContent
          />
          {route && (
            <Polyline
              coordinates={route.coordinates}
              strokeColor="#0754bd"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          )}
          {clinicsNearRegion.map((clinic) => (
            <Marker
              key={clinic.id}
              coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
              title={clinic.name}
              description={`${clinic.specialty} · ${clinic.distance.toFixed(1)} km`}
            >
              <View style={styles.mapMarker}>
                <Text style={styles.markerPlus}>+</Text>
              </View>
            </Marker>
          ))}
          <Marker coordinate={mapCenter} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.currentLocation}>
              <View style={styles.currentLocationDot} />
            </View>
          </Marker>
        </MapView>

        <View style={styles.searchBar}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Buscar por nome ou especialidade"
            onChangeText={setSearch}
            placeholder="Nome ou especialidade..."
            placeholderTextColor="#9aa1ab"
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={emergencyOnly ? 'Remover filtro de emergência' : 'Filtrar emergência 24 horas'}
            onPress={() => setEmergencyOnly((current) => !current)}
            style={[styles.filterButton, emergencyOnly && styles.filterButtonActive]}
          >
            <Text style={styles.filterIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapAttribution}>
          <Text style={styles.attributionText}>© OpenStreetMap</Text>
        </View>

        <View style={styles.resultBadge}>
          {route ? (
            <View style={styles.routeSummary}>
              <View style={styles.routeSummaryText}>
                <Text style={styles.resultText}>{route.clinicName}</Text>
                <Text style={styles.routeMeta}>
                  {(route.distance / 1000).toFixed(1)} km · {Math.max(1, Math.round(route.duration / 60))} min de carro
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ir para Maps"
                onPress={openRouteInMaps}
                style={styles.openMapsButton}
              >
                <Text style={styles.openMapsButtonText}>Ir para Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar rota"
                onPress={clearRoute}
                style={styles.closeRouteButton}
              >
                <Text style={styles.closeRouteText}>×</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.resultText}>
              {routeStatus ||
                `${visibleClinics.length} ${visibleClinics.length === 1 ? 'clínica de exemplo' : 'clínicas de exemplo'}`}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos a você</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setSortAlphabetically((current) => !current)}
            >
              <Text style={styles.sortText}>{sortAlphabetically ? 'A-Z' : 'Ordenar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={!clinicsLoaded}
              onPress={() => setAddClinicVisible(true)}
              style={[styles.addClinicButton, !clinicsLoaded && styles.addClinicButtonDisabled]}
            >
              <Text style={styles.addClinicButtonText}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={visibleClinics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma clínica encontrada. Tente outra busca.</Text>
          }
          renderItem={({ item }) => (
            <ClinicCard
              clinic={item}
              isFavorite={favorites.includes(item.id)}
              onFavorite={toggleFavorite}
              onShare={shareClinic}
              onShowOnMap={showClinicOnMap}
            />
          )}
        />
      </View>

      <AddClinicModal
        visible={addClinicVisible}
        onClose={() => setAddClinicVisible(false)}
        onSave={addClinic}
      />

      <View style={styles.bottomBar}>
        {[
          ['Início', '⌂'],
          ['Pet', '♧'],
          ['Planos', '▢'],
          ['Loja', '▣'],
          ['Perfil', '♙'],
        ].map(([label, icon]) => (
          <TouchableOpacity
            key={label}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === label }}
            onPress={() => setActiveTab(label)}
            style={styles.tab}
          >
            <Text style={[styles.tabIcon, activeTab === label && styles.tabActive]}>{icon}</Text>
            <Text style={[styles.tabLabel, activeTab === label && styles.tabActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mapSection: {
    height: '37%',
    minHeight: 230,
    overflow: 'hidden',
    backgroundColor: '#e8e5dc',
  },
  searchBar: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 5,
    elevation: 4,
    shadowColor: '#1b2b45',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  backIcon: {
    color: '#667080',
    fontSize: 32,
    lineHeight: 36,
    marginRight: 8,
  },
  searchIcon: {
    color: '#8c96a3',
    fontSize: 24,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#27364a',
    fontSize: 13,
    paddingVertical: 0,
  },
  filterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064db1',
  },
  filterButtonActive: {
    backgroundColor: '#083b83',
  },
  filterIcon: {
    color: '#ffffff',
    fontSize: 15,
    transform: [{ rotate: '180deg' }],
  },
  mapAttribution: {
    position: 'absolute',
    right: 8,
    bottom: 34,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  attributionText: {
    color: '#45515f',
    fontSize: 9,
  },
  resultBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    maxWidth: '90%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#1b2b45',
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  resultText: {
    color: '#064db1',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  routeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 250,
  },
  routeSummaryText: {
    alignItems: 'center',
    paddingRight: 8,
  },
  routeMeta: {
    color: '#566477',
    fontSize: 10,
    marginTop: 2,
  },
  closeRouteButton: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#edf3ff',
  },
  openMapsButton: {
    borderRadius: 16,
    backgroundColor: '#ffdf00',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 7,
  },
  openMapsButtonText: {
    color: '#123d7d',
    fontSize: 10,
    fontWeight: '700',
  },
  closeRouteText: {
    color: '#064db1',
    fontSize: 21,
    lineHeight: 23,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064db1',
    elevation: 5,
  },
  markerPlus: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 23,
  },
  currentLocation: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: 'rgba(34, 129, 238, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 129, 238, 0.18)',
  },
  currentLocationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#2080ed',
  },
  listSection: {
    flex: 1,
    minHeight: 0,
    paddingTop: 13,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 17,
    paddingBottom: 9,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortText: {
    color: '#064db1',
    fontSize: 12,
    fontWeight: '600',
  },
  addClinicButton: {
    borderRadius: 16,
    backgroundColor: '#064db1',
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  addClinicButtonDisabled: {
    opacity: 0.55,
  },
  addClinicButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  card: {
    marginBottom: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e7e9ed',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#25344b',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardMain: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  clinicIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf3ff',
    marginRight: 10,
  },
  pinSmall: {
    color: '#064db1',
    fontSize: 24,
    fontWeight: '700',
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    color: '#202936',
    fontSize: 13,
    fontWeight: '700',
  },
  specialty: {
    marginTop: 2,
    color: '#828b98',
    fontSize: 11,
  },
  clinicAddress: {
    marginTop: 2,
    color: '#657184',
    fontSize: 9,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    color: '#ffd400',
    fontSize: 15,
    marginRight: 3,
  },
  detailText: {
    color: '#46505e',
    fontSize: 10,
    fontWeight: '600',
  },
  detailSeparator: {
    color: '#9da5af',
    fontSize: 13,
    marginHorizontal: 6,
  },
  favoriteButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  heart: {
    color: '#aeb6c0',
    fontSize: 26,
  },
  heartActive: {
    color: '#e55464',
  },
  cardActions: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  shareIcon: {
    color: '#a9b1bc',
    fontSize: 18,
    marginRight: 5,
  },
  shareText: {
    color: '#a1a9b4',
    fontSize: 10,
  },
  routeButton: {
    minWidth: 94,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ffdf00',
    paddingHorizontal: 12,
  },
  routeIcon: {
    color: '#064db1',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  routeText: {
    color: '#123d7d',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    paddingHorizontal: 12,
    paddingVertical: 24,
    color: '#778190',
    fontSize: 13,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 30, 50, 0.5)',
    paddingHorizontal: 18,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  formCard: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: {
    color: '#202936',
    fontSize: 18,
    fontWeight: '700',
  },
  formSubtitle: {
    color: '#778190',
    fontSize: 11,
    marginTop: 3,
  },
  formCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf3ff',
  },
  formCloseText: {
    color: '#064db1',
    fontSize: 22,
    lineHeight: 25,
  },
  inputLabel: {
    color: '#364256',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    height: 43,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#e1e6ed',
    backgroundColor: '#ffffff',
    color: '#202936',
    fontSize: 13,
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  orLabel: {
    color: '#364256',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  coordinateHint: {
    color: '#778190',
    fontSize: 10,
    marginBottom: 7,
  },
  coordinateFields: {
    flexDirection: 'row',
    gap: 9,
  },
  coordinateInput: {
    flex: 1,
  },
  emergencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 1,
    marginBottom: 14,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderWidth: 1,
    borderColor: '#b5bfcc',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#064db1',
    backgroundColor: '#064db1',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emergencyLabel: {
    color: '#364256',
    fontSize: 11,
  },
  formError: {
    color: '#bf3443',
    fontSize: 11,
    marginBottom: 10,
  },
  saveClinicButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#064db1',
  },
  saveClinicButtonDisabled: {
    opacity: 0.7,
  },
  saveClinicText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomBar: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#064db1',
    borderTopWidth: 1,
    borderTopColor: '#d9e3f2',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
  },
  tabIcon: {
    color: '#bfd2f0',
    fontSize: 21,
    lineHeight: 24,
  },
  tabLabel: {
    color: '#bfd2f0',
    fontSize: 9,
    marginTop: 1,
  },
  tabActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
