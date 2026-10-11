import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

type TipoPet = 'Cachorro' | 'Gato' | 'Outro';
type Porte = 'Pequeno' | 'Médio' | 'Grande';

const COLORS = {
  blue: '#0033A0',
  yellow: '#f6e01e',
  bg: '#eef2f7',
  input: '#d0d7df',
  card: '#ffffff',
  text: '#1c1b1b',
  muted: '#03020d',
};

const TIPOS: TipoPet[] = ['Cachorro', 'Gato', 'Outro'];
const PORTES: Porte[] = ['Pequeno', 'Médio', 'Grande'];
const RACAS_POR_TIPO: Record<TipoPet, string[]> = {
  Cachorro: [
    'Akita',
    'Beagle',
    'Border Collie',
    'Bulldog',
    'Chihuahua',
    'Dachshund',
    'Golden Retriever',
    'Husky Siberiano',
    'Labrador',
    'Lhasa Apso',
    'Pastor Alemão',
    'Pinscher',
    'Poodle',
    'Pug',
    'Rottweiler',
    'Shih Tzu',
    'Spitz Alemão',
    'Vira-lata',
  ],
  Gato: [
    'Angorá',
    'Bengal',
    'British Shorthair',
    'Maine Coon',
    'Persa',
    'Ragdoll',
    'Siamês',
    'Sphynx',
    'SRD',
  ],
  Outro: [
    'Calopsita',
    
    'Periquito-australiano',
    
  ],
};

const normalizarTexto = (valor: string) =>
  valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

function PataCachorro({ tamanho }: { tamanho: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={COLORS.blue}>
      <Ellipse cx={4.8} cy={7.6} rx={2.2} ry={2.8} transform="rotate(-30 4.8 7.6)" />
      <Ellipse cx={9} cy={4.8} rx={2.2} ry={2.8} transform="rotate(-10 9 4.8)" />
      <Ellipse cx={15} cy={4.8} rx={2.2} ry={2.8} transform="rotate(10 15 4.8)" />
      <Ellipse cx={19.2} cy={7.6} rx={2.2} ry={2.8} transform="rotate(30 19.2 7.6)" />
      <Path d="M8.2 10.4c.3-1.6 2.2-1.9 3.8-.8 1.6-1.1 3.5-.8 3.8.8 1.5-.1 2.3 1.1 1.8 2.4-.7 2-3.3 3.9-5.6 5.2-2.3-1.3-4.9-3.2-5.6-5.2-.5-1.3.3-2.5 1.8-2.4Z" />
    </Svg>
  );
}

function IconeTipoPet({ tipo }: { tipo: TipoPet }) {
  if (tipo === 'Outro') {
    return (
      <Svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M12 17 4 10M12 17V6M12 17l8-7" />
      </Svg>
    );
  }

  if (tipo === 'Cachorro') {
    return <PataCachorro tamanho={20} />;
  }

  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={COLORS.blue}>
      <Ellipse cx={6} cy={7} rx={1.7} ry={2.3} transform="rotate(-24 6 7)" />
      <Ellipse cx={9.7} cy={4.8} rx={1.7} ry={2.3} transform="rotate(-10 9.7 4.8)" />
      <Ellipse cx={14.3} cy={4.8} rx={1.7} ry={2.3} transform="rotate(10 14.3 4.8)" />
      <Ellipse cx={18} cy={7} rx={1.7} ry={2.3} transform="rotate(24 18 7)" />
      <Path d="M12 10.5c-.9-1.2-2.5-1.3-3.1-.2-1-.6-2.1.1-1.9 1.3.3 1.7 2.7 3.7 5 5.4 2.3-1.7 4.7-3.7 5-5.4.2-1.2-.9-1.9-1.9-1.3-.6-1.1-2.2-1-3.1.2Z" />
    </Svg>
  );
}

export default function CadastrarPetScreen({ navigation }: { navigation?: any }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoPet>('Cachorro');
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState('');
  const [porte, setPorte] = useState<Porte>('Pequeno');
  const [microchipado, setMicrochipado] = useState(false);
  const [fotoPet, setFotoPet] = useState<string | null>(null);

  const termoRaca = normalizarTexto(raca);
  const racasSugeridas = termoRaca
    ? RACAS_POR_TIPO[tipo]
        .filter((opcao) => {
          const opcaoNormalizada = normalizarTexto(opcao);
          return opcaoNormalizada.includes(termoRaca) && opcaoNormalizada !== termoRaca;
        })
        .slice(0, 5)
    : [];

  const escolherFoto = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets[0]) {
        setFotoPet(resultado.assets[0].uri);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir as fotos do dispositivo.');
    }
  };


  const salvar = () => {
    const pet = { nome, tipo, raca, idade, porte, microchipado };
    console.log('Pet cadastrado:', pet);
    // navigation?.navigate('ProximaTela', { pet });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} hitSlop={12}>
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CADASTRAR PET</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerLine} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Foto */}
        <View style={styles.photoWrap}>
          <TouchableOpacity
            style={styles.photoCircle}
            activeOpacity={0.8}
            onPress={escolherFoto}
            accessibilityRole="button"
            accessibilityLabel="Escolher foto do pet"
          >
            {fotoPet ? (
              <Image
                source={{ uri: fotoPet }}
                style={styles.photoImage}
                resizeMode="cover"
              />
            ) : (
              <PataCachorro tamanho={58} />
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>
            {fotoPet ? 'Alterar Foto' : 'Adicionar Foto'}
          </Text>
        </View>

        <View style={styles.card}>
          {/* Nome */}
          <Text style={styles.label}>Nome do Pet</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mel"
            placeholderTextColor={COLORS.muted}
            value={nome}
            onChangeText={setNome}
          />

          {/* Tipo */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Tipo de Pet</Text>
          </View>
          <View style={styles.chipRow}>
            {TIPOS.map((t) => {
              const ativo = tipo === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, ativo && styles.chipActive]}
                  onPress={() => {
                    setTipo(t);
                    setRaca('');
                  }}
                >
                  <View style={styles.chipContent}>
                    <Text style={[styles.chipText, ativo && styles.chipTextActive]}>
                      {t}
                    </Text>
                    <IconeTipoPet tipo={t} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Digite sua raça"
            placeholderTextColor={COLORS.muted}
            value={raca}
            onChangeText={setRaca}
          />
          {racasSugeridas.length > 0 && (
            <View style={styles.breedSuggestions}>
              {racasSugeridas.map((opcao) => (
                <TouchableOpacity
                  key={opcao}
                  style={styles.breedSuggestion}
                  onPress={() => setRaca(opcao)}
                  accessibilityRole="button"
                >
                  <Text style={styles.breedSuggestionText}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Idade */}
          <Text style={styles.label}>Idade</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira a idade"
            placeholderTextColor={COLORS.muted}
            keyboardType="numeric"
            value={idade}
            onChangeText={setIdade}
          />

          {/* Porte */}
          <Text style={styles.label}>Porte</Text>
          <View style={styles.segment}>
            {PORTES.map((p) => {
              const ativo = porte === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.segmentItem, ativo && styles.segmentActive]}
                  onPress={() => setPorte(p)}
                >
                  <Text style={[styles.segmentText, ativo && styles.segmentTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Microchipado */}
          <View style={styles.switchRow}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { marginTop: 0 }]}>Pet Microchipado?</Text>
            </View>
            <Switch
              value={microchipado}
              onValueChange={setMicrochipado}
              trackColor={{ false: COLORS.input, true: COLORS.blue }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={salvar} activeOpacity={0.85}>
          <Text style={styles.saveText}>SALVAR E CONTINUAR</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.terms}>Termos e Condições</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: { color: '#fff', fontSize: 36, lineHeight: 36, width: 30 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  helpBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerLine: { height: 4, backgroundColor: COLORS.yellow },

  scroll: { paddingBottom: 24 },

  photoWrap: { alignItems: 'center', marginTop: 24, marginBottom: -56, zIndex: 2 },
  photoCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 54,
  },
  breedSuggestions: {
    marginTop: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe4ee',
    borderRadius: 16,
    overflow: 'hidden',
  },
  breedSuggestion: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  breedSuggestionText: { color: COLORS.text, fontSize: 15 },
  photoLabel: { marginTop: 4, fontSize: 13, color: COLORS.text },

  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginTop: 0,
    paddingTop: 70,
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  label: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12, marginBottom: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    backgroundColor: '#D9D9D9',
    borderWidth: 1,
    borderColor: '#b8c1ce',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },

  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#DCE3F4' },
  chipContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { color: COLORS.blue, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: COLORS.text, fontWeight: '800' },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#cfd7e0',
    borderRadius: 18,
    padding: 2,
    borderWidth: 1,
    borderColor: '#b8c1ce',
  },
  segmentItem: { flex: 1, paddingVertical: 8, borderRadius: 16, alignItems: 'center' },
  segmentActive: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: COLORS.blue },
  segmentText: { fontSize: 12, color: COLORS.muted },
  segmentTextActive: { color: COLORS.text, fontWeight: '700' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    alignItems: 'center',
  },
  saveBtn: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.blue,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  Racas: {
color :COLORS.text,
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  terms: {
    marginTop: 8,
    fontSize: 10,
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
});