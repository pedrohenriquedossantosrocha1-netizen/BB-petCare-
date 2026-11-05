import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type EmergencyType = 'pouco' | 'urgente' | 'muito' | 'emergencia';

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
      text: '#6d5004',
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
  const activeOption = emergencyOptions.find(
    (option) => option.key === activeEmergency,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={styles.topBar} />
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
                  onPress={() => {
                    setSelected(option.key);
                    setCancelConfirmation(false);
                    setActiveEmergency(option.key);
                  }}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: option.colors.bg,
                      borderColor: isActive ? option.colors.border : '#d3dfe8',
                      borderWidth: isActive ? 3 : 1,
                    },
                  ]}
                  android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir detalhes: ${option.title.replace('\n', ' ')}`}
                  accessibilityState={{ selected: isActive }}
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
            style={styles.continueButton}
            accessibilityRole="button"
          >
            <Text style={styles.continueButtonText}>SALVAR E CONTINUAR</Text>
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
                        onPress={() => {
                          setCancelConfirmation(false);
                          setActiveEmergency(null);
                        }}
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
  continueButton: {
    width: '100%',
    minHeight: 48,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#1c66d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#fff',
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
    color: '#a41d1d',
    fontSize: 14,
    fontWeight: '800',
  },
});
