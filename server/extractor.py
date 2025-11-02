import pandas as pd
import json

pd.set_option('future.no_silent_downcasting', True)
df = pd.read_excel('server\converted\COMISIONES-DE-UN-PERIODO-2_2025-ANUAL_2025-v08-CON-AULAS (1).xlsx')
df = df.iloc[2:]
df.columns = ['Codigo', 'Actividad', 'Comision', 'Inicio', 'Fin', 'Dia', 'Horario', 'Docentes', 'Aula', 'Edificacion', 'Compartido', 'Tipo', 'Instancia']
df = df.drop(['Codigo', 'Inicio', 'Fin', 'Compartido', 'Instancia'], axis=1)
df = df.fillna('')
# df['Inicio'] = pd.to_datetime(df['Inicio'], format='%Y-%m-%d')
# df['Fin'] = pd.to_datetime(df['Fin'], format='%Y-%m-%d')
for col in df.columns:
  df[col] = df[col].astype(str)
  df[col] = df[col].str.replace('\n', ' ').str.strip()
dias= ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
df['Dia'] = pd.Categorical(df['Dia'], categories=dias, ordered=True)
df = df.sort_values(by=['Actividad', 'Dia', 'Horario'])

data = df.groupby('Comision').agg({
    'Actividad': lambda x: x.iloc[0],
    # 'Inicio': lambda x: x.iloc[0],
    # 'Fin': lambda x: x.iloc[0],
    'Docentes': lambda x: x.iloc[0],
    'Dia': lambda x: list(x),
    'Horario': lambda x: list(x),
    'Aula': lambda x: list(x),
    'Edificacion': lambda x: list(x),
    'Tipo': lambda x: list(x)
}).to_dict(orient='index')

for comision in data:
  data[comision]['Docentes'] = data[comision]['Docentes'].split(', ')
  for i in range(len(data[comision]['Tipo'])):
    data[comision]['Tipo'][i] = data[comision]['Tipo'][i].replace('/', ' ')
  for i in range(len(data[comision]['Aula'])):
    data[comision]['Aula'][i] = data[comision]['Aula'][i].replace('AULA', '').strip()

with open('data\comisiones.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)