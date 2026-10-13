import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type EmergencyType = 'pouco' | 'urgente' | 'muito' | 'emergencia';

const menuItems = [
  'Configurações',
  'Segurança',
  'Atendimentos',
  'Clínica Vip',
  'Redes sociais',
  'Cadastrar Cartão',
  'Sair da Conta',
];

const emergencyOptions = [
  {
    key: 'pouco' as const,
    title: 'Pouco\nUrgente',
    description: 'Não representa\nrisco imediato',
    colors: {
      bg: '#d8f3ef',
      border: '#5bc0b4',
      text: '#10423d',
    },
  },
  {
    key: 'urgente' as const,
    title: 'Urgente',
    description: 'Atendimento rápido\nnecessário',
    colors: {
      bg: '#d9f0d7',
      border: '#46b76a',
      text: '#1f5432',
    },
  },
  {
    key: 'muito' as const,
    title: 'Muito\nUrgente',
    description: 'Risco alto. Necessário\natendimento imediato',
    colors: {
      bg: '#f6efc8',
      border: '#e7bd45',
      text: '#664b09',
    },
  },
  {
    key: 'emergencia' as const,
    title: 'Emergência',
    description: 'Situação crítica. Precisa\nde socorro imediato',
    colors: {
      bg: '#f9d7d8',
      border: '#e55a5a',
      text: '#8b1c1c',
    },
  },
];

export default function EmergenciaScreen() {
  const [selected, setSelected] = useState<EmergencyType>('urgente');
  const [activeEmergency, setActiveEmergency] = useState<EmergencyType | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const activeOption = emergencyOptions.find(
    (option) => option.key === activeEmergency,
  );

  const filteredMenuItems = menuItems.filter((item) =>
    item.toLocaleLowerCase('pt-BR').includes(menuSearch.toLocaleLowerCase('pt-BR')),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.8}
            onPress={() => setMenuOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <View style={styles.menuIcon} />
            <View style={styles.menuIcon} />
            <View style={styles.menuIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.yellowBar} />

        <View style={styles.content}>
          <View style={styles.alertWrap}>
            <View style={styles.alertCircle}>
              <Text style={styles.alertText}>!</Text>
            </View>
          </View>

          <Text style={styles.title}>Qual a emergência?</Text>
          <Text style={styles.subtitle}>
            Selecione o tipo de ocorrência para que possamos te ajudar o mais rápido
            possível
          </Text>

          <View style={styles.grid}>
            {emergencyOptions.map((option) => {
              const isActive = selected === option.key;

              return (
                <Pressable
                  key={option.key}
                  onPress={() => setSelected(option.key)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: option.colors.bg,
                      borderColor: isActive ? option.colors.border : '#d3dfe8',
                      borderWidth: isActive ? 3 : 1,
                    },
                  ]}
                  android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                >
                  <Text style={[styles.optionTitle, { color: option.colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: option.colors.text }]}>
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              setCancelConfirmation(false);
              setActiveEmergency(selected);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              VER DETALHES DA EMERGÊNCIA
            </Text>
          </Pressable>
        </View>

        <Modal
          visible={activeEmergency !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setCancelConfirmation(true)}
        >
          <View style={styles.modalOverlay}>
            {activeOption && (
              <View style={styles.emergencyDialog}>
                <View
                  style={[
                    styles.emergencyBadge,
                    { backgroundColor: activeOption.colors.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.emergencyBadgeText,
                      { color: activeOption.colors.text },
                    ]}
                  >
                    {activeOption.title.replace('\n', ' ')}
                  </Text>
                </View>

                {cancelConfirmation ? (
                  <>
                    <Text style={styles.dialogTitle}>Cancelar este pedido?</Text>
                    <Text style={styles.dialogText}>
                      O pedido de {activeOption.title.replace('\n', ' ').toLowerCase()}{' '}
                      será encerrado nesta demonstração.
                    </Text>
                    <View style={styles.dialogActions}>
                      <Pressable
                        style={styles.keepButton}
                        onPress={() => setCancelConfirmation(false)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.keepButtonText}>MANTER PEDIDO</Text>
                      </Pressable>
                      <Pressable
                        style={styles.confirmCancelButton}
                        onPress={() => {
                          setCancelConfirmation(false);
                          setActiveEmergency(null);
                        }}
                        accessibilityRole="button"
                      >
                        <Text style={styles.confirmCancelButtonText}>
                          SIM, CANCELAR
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.dialogTitle}>
                      Emergência: {activeOption.title.replace('\n', ' ').toLowerCase()}
                    </Text>
                    <Text style={styles.dialogText}>{activeOption.description}</Text>
                    <Text style={styles.demoNotice}>
                      Este app ainda não está conectado a uma central de atendimento.
                      Nenhum serviço de emergência foi chamado.
                    </Text>
                    <Pressable
                      style={styles.cancelRequestButton}
                      onPress={() => setCancelConfirmation(true)}
                      accessibilityRole="button"
                    >
                      <Text style={styles.cancelRequestButtonText}>
                        CANCELAR PEDIDO
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </View>
        </Modal>

        {menuOpen && (
          <View style={styles.drawerOverlay}>
            <View style={styles.drawer}>
              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.8}
                onPress={() => setMenuOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Fechar menu"
              >
                <View style={styles.menuIcon} />
                <View style={styles.menuIcon} />
                <View style={styles.menuIcon} />
              </TouchableOpacity>

              <View style={styles.searchBox}>
                <TextInput
                  value={menuSearch}
                  onChangeText={setMenuSearch}
                  placeholder="Buscar"
                  placeholderTextColor="#65758b"
                  style={styles.searchInput}
                  accessibilityLabel="Buscar no menu"
                />
                <Text style={styles.searchIcon}>⌕</Text>
              </View>

              <View style={styles.drawerItems}>
                {filteredMenuItems.map((item) => (
                  <Pressable
                    key={item}
                    style={styles.drawerItem}
                    accessibilityRole="button"
                    accessibilityLabel={item}
                  >
                    <View style={styles.drawerItemIcon}>
                      <Text style={styles.drawerItemIconText}>▣</Text>
                    </View>
                    <Text numberOfLines={1} style={styles.drawerItemText}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable
              style={styles.drawerBackdrop}
              onPress={() => setMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2f6',
  },
  frame: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  topBar: {
    height: 82,
    backgroundColor: '#0b2d8a',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  yellowBar: {
    height: 26,
    backgroundColor: '#ffd600',
  },
  menuButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2862aa',
    borderRadius: 4,
  },
  menuIcon: {
    width: 18,
    height: 3,
    backgroundColor: '#f3f6fb',
    borderRadius: 2,
    marginVertical: 1,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    zIndex: 10,
    elevation: 10,
  },
  drawer: {
    width: '60%',
    backgroundColor: '#073982',
    paddingHorizontal: 10,
    paddingTop: 20,
    zIndex: 1,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchBox: {
    height: 38,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginTop: 40,
    marginBottom: 14,
    paddingLeft: 12,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: '#1c1f2a',
    fontSize: 13,
    paddingVertical: 0,
  },
  searchIcon: {
    color: '#174a91',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  drawerItems: {
    gap: 10,
  },
  drawerItem: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef1f5',
    borderRadius: 4,
    paddingHorizontal: 6,
    gap: 7,
  },
  drawerItemIcon: {
    width: 17,
    height: 24,
    borderRadius: 3,
    backgroundColor: '#ffdf32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemIconText: {
    color: '#29477a',
    fontSize: 12,
    fontWeight: '700',
  },
  drawerItemText: {
    flex: 1,
    color: '#101827',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    paddingHorizontal: 18,
    paddingTop: 6,
    alignItems: 'center',
  },
  alertWrap: {
    marginTop: 12,
    marginBottom: 8,
    width: 170,
    height: 170,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#f32d2d',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  alertCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    color: '#f32d2d',
    fontSize: 108,
    lineHeight: 108,
    fontWeight: '900',
    includeFontPadding: false,
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 28,
    color: '#1c1f2a',
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    color: '#4a5568',
    textAlign: 'center',
    width: '92%',
    marginBottom: 12,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 10,
    marginTop: 4,
  },
  optionCard: {
    width: '48.6%',
    minHeight: 118,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  optionTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 11,
    lineHeight: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    height: 58,
    borderRadius: 12,
    backgroundColor: '#1c66d8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0b2d8a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 24, 48, 0.58)',
  },
  emergencyDialog: {
    width: '88%',
    maxWidth: 400,
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emergencyBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 14,
  },
  emergencyBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dialogTitle: {
    color: '#1c1f2a',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  dialogText: {
    marginTop: 10,
    color: '#4a5568',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  demoNotice: {
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff3d6',
    color: '#674b0a',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  cancelRequestButton: {
    width: '100%',
    minHeight: 48,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#fbe4e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRequestButtonText: {
    color: '#9b2222',
    fontSize: 15,
    fontWeight: '800',
  },
  dialogActions: {
    width: '100%',
    gap: 10,
    marginTop: 22,
  },
  keepButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#1c66d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmCancelButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: '#fbe4e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelButtonText: {
    color: '#9b2222',
    fontSize: 14,
    fontWeight: '800',
  },
});
