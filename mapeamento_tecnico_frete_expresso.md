# Relatório Técnico - Mapeamento de Engenharia e Banco de Dados (US 5899)
**Módulo:** Frete Expresso
**Pilha de Tecnologia:** Java 17+ | Spring Boot 3+ (Spring Security 6) | OracleDB | Angular + M3

---

## 1. Script SQL Completo (Modelagem de Banco de Dados - OracleDB)

O script abaixo foi modelado para a sintaxe do **Oracle Database**, utilizando chaves UUID do tipo `VARCHAR2(36)` geradas automaticamente por padrão com `SYS_GUID()`. A auditoria utiliza `TIMESTAMP(3)` para garantir a precisão milimétrica.

```sql
-- DDL Script para o módulo "Frete Expresso" - OracleDB
-- Baseado na especificação funcional (2026.06.24 V2 5899 Fluxo de Aprovação Frete Expresso.pdf)
-- e Prompt.pdf.

-- Recomendações:
-- 1. Este script assume que as tabelas 'Frete' (demandas/solicitações de frete)
--    e 'Transportador' (cadastros de transportadores) já existem no sistema legado.
--    Os comandos ALTER TABLE são para estas tabelas existentes.
-- 2. Utilize um sistema de gerenciamento de migrações (Flyway, Liquibase)
--    para controlar as versões do seu schema em ambientes de produção.
-- 3. UUIDs são representados como VARCHAR2(36) e gerados via SYS_GUID() para consistência com o protótipo Angular.

-- =========================================================
-- 1. Tabelas Administrativas e de Configuração
-- =========================================================

-- Tabela: CONFIGURACAO_FRETE_EXPRESSO
-- Armazena chaves e valores das variáveis operacionais e parâmetros gerais.
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE CONFIGURACAO_FRETE_EXPRESSO (
        CHAVE VARCHAR2(100) PRIMARY KEY,
        VALOR VARCHAR2(500) NOT NULL,
        TIPO_DADO VARCHAR2(50) NOT NULL, -- Ex: ''NUMERIC'', ''INTEGER'', ''TIME'', ''BOOLEAN'', ''STRING''
        DESCRICAO VARCHAR2(4000),
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL; -- Table already exists, do nothing
END;
/
COMMENT ON TABLE CONFIGURACAO_FRETE_EXPRESSO IS 'Armazena variáveis de configuração globais para o módulo Frete Expresso.';
COMMENT ON COLUMN CONFIGURACAO_FRETE_EXPRESSO.CHAVE IS 'Chave única de identificação da configuração (ex: raio_max_aglutinacao_km).';
COMMENT ON COLUMN CONFIGURACAO_FRETE_EXPRESSO.VALOR IS 'Valor da configuração.';
COMMENT ON COLUMN CONFIGURACAO_FRETE_EXPRESSO.TIPO_DADO IS 'Tipo de dado esperado para o valor da configuração.';
/

-- Tabela: CALENDARIO_FERIADOS_NACIONAIS
-- Armazena feriados nacionais para consulta do motor de minutos úteis do SLA.
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE CALENDARIO_FERIADOS_NACIONAIS (
        DATA_FERIADO DATE PRIMARY KEY,
        DESCRICAO VARCHAR2(255) NOT NULL,
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE CALENDARIO_FERIADOS_NACIONAIS IS 'Calendário de feriados nacionais para controle do SLA.';
COMMENT ON COLUMN CALENDARIO_FERIADOS_NACIONAIS.DATA_FERIADO IS 'Data do feriado.';
COMMENT ON COLUMN CALENDARIO_FERIADOS_NACIONAIS.DESCRICAO IS 'Descrição do feriado.';
/

-- Tabela: MATRIZ_APROVACAO_FRETE
-- Estrutura hierárquica e regras matemáticas do motor de aprovações.
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE MATRIZ_APROVACAO_FRETE (
        ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
        UNIT_CD VARCHAR2(50) NOT NULL, -- Código da Unidade do cliente (Unit CD)
        SEQUENCIA NUMBER(1) NOT NULL,    -- Sequência de aprovação (1 a 5)
        VALOR_MINIMO NUMBER(18, 2) NOT NULL, -- Custo financeiro inicial da faixa
        VALOR_MAXIMO NUMBER(18, 2) NOT NULL, -- Custo financeiro teto da faixa
        ID_USUARIO_APROVADOR VARCHAR2(50) NOT NULL, -- ID corporativo e nome do Aprovador
        FLAG_AUSENCIA_ATIVA NUMBER(1) DEFAULT 0 NOT NULL,
        AUSENCIA_INICIO TIMESTAMP WITH TIME ZONE,
        AUSENCIA_FIM TIMESTAMP WITH TIME ZONE,
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT CHK_MATRIZ_SEQUENCIA CHECK (SEQUENCIA BETWEEN 1 AND 5),
        CONSTRAINT CHK_MATRIZ_FLAG_AUSENCIA CHECK (FLAG_AUSENCIA_ATIVA IN (0,1)),
        UNIQUE (UNIT_CD, SEQUENCIA),
        UNIQUE (UNIT_CD, VALOR_MINIMO, VALOR_MAXIMO)
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE MATRIZ_APROVACAO_FRETE IS 'Define a matriz hierárquica de aprovação para fretes, por Unidade e faixa de valor.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.UNIT_CD IS 'Código da Unidade do cliente.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.SEQUENCIA IS 'Sequência de aprovação dentro da hierarquia (1 a 5).';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.VALOR_MINIMO IS 'Valor financeiro mínimo para esta faixa de aprovação.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.VALOR_MAXIMO IS 'Valor financeiro máximo para esta faixa de aprovação.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.ID_USUARIO_APROVADOR IS 'ID do usuário aprovador associado a esta etapa.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.FLAG_AUSENCIA_ATIVA IS 'Indica se o aprovador possui ausência programada (0=Falso, 1=Verdadeiro).';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.AUSENCIA_INICIO IS 'Início do período de ausência do aprovador.';
COMMENT ON COLUMN MATRIZ_APROVACAO_FRETE.AUSENCIA_FIM IS 'Fim do período de ausência do aprovador.';
/



-- Tabela: TIPO_OCORRENCIA_CUSTO_EXTRA
-- Tabela de lookup para os tipos de ocorrências de custos extras.
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE TIPO_OCORRENCIA_CUSTO_EXTRA (
        ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
        NOME VARCHAR2(100) UNIQUE NOT NULL,
        DESCRICAO VARCHAR2(4000),
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE TIPO_OCORRENCIA_CUSTO_EXTRA IS 'Tipos pré-definidos de ocorrências de custos extras (Step 06).';
/

-- =========================================================
-- 2. Tabelas Transacionais e de Exceção
-- =========================================================

-- Tabela: OCORRENCIA_CUSTO_EXTRA
-- Registra os custos extras solicitados pós-pedido (Step 06).
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE OCORRENCIA_CUSTO_EXTRA (
        ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
        ID_FRETE VARCHAR2(50) NOT NULL, -- FK para a tabela de Fretes (assumido como VARCHAR pelo ID do protótipo)
        ID_TRANSPORTADOR VARCHAR2(50) NOT NULL, -- FK para a tabela de Transportadores
        TIPO_OCORRENCIA_ID VARCHAR2(36) NOT NULL, -- FK para TIPO_OCORRENCIA_CUSTO_EXTRA
        VALOR_DELTA_SOLICITADO NUMBER(18, 2) NOT NULL,
        JUSTIFICATIVA_TEXTO VARCHAR2(4000) NOT NULL,
        STATUS_APROVACAO VARCHAR2(50) NOT NULL, -- ENUM: ''Pendente'', ''Aprovado'', ''Recusado''
        DATA_CRIACAO TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT CHK_OCORRENCIA_STATUS CHECK (STATUS_APROVACAO IN (''Pendente'', ''Aprovado'', ''Recusado'')),
        CONSTRAINT FK_OCORRENCIA_TIPO FOREIGN KEY (TIPO_OCORRENCIA_ID) REFERENCES TIPO_OCORRENCIA_CUSTO_EXTRA(ID)
        -- CONSTRAINT FK_OCORRENCIA_FRETE FOREIGN KEY (ID_FRETE) REFERENCES Frete(id), -- Descomentar se Frete.id for VARCHAR2(36) ou outro tipo
        -- CONSTRAINT FK_OCORRENCIA_TRANSP FOREIGN KEY (ID_TRANSPORTADOR) REFERENCES Transportador(id)
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE OCORRENCIA_CUSTO_EXTRA IS 'Registra ocorrências de custos extras pós-pedido (Step 06).';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.ID_FRETE IS 'ID do frete associado.';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.ID_TRANSPORTADOR IS 'ID do transportador que solicitou o custo extra.';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.TIPO_OCORRENCIA_ID IS 'Tipo de ocorrência de custo extra.';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.VALOR_DELTA_SOLICITADO IS 'Valor extra solicitado.';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.JUSTIFICATIVA_TEXTO IS 'Justificativa para o custo extra.';
COMMENT ON COLUMN OCORRENCIA_CUSTO_EXTRA.STATUS_APROVACAO IS 'Status de aprovação do custo extra (Pendente, Aprovado, Recusado).';
/

-- Tabela: LOG_AUDITORIA_FRETE_EXPRESSO
-- Tabela de histórico imutável para auditoria das ações e transições de status.
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE LOG_AUDITORIA_FRETE_EXPRESSO (
        ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
        ID_FRETE VARCHAR2(50) NOT NULL, -- FK para a tabela de Fretes
        USUARIO_ACAO VARCHAR2(255) NOT NULL, -- Nome ou ID do usuário que realizou a ação
        DESCRICAO_ACAO CLOB, -- Descrição detalhada da ação/transição
        DATA_HORA_EVENTO TIMESTAMP(3) WITH TIME ZONE NOT NULL, -- Carimbo de tempo com milissegundos e fuso horário
        FUSO_HORARIO VARCHAR2(10) DEFAULT ''UTC-3'' NOT NULL,
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        -- CONSTRAINT FK_LOG_AUDITORIA_FRETE FOREIGN KEY (ID_FRETE) REFERENCES Frete(id) -- Descomentar se Frete.id for VARCHAR2(36) ou outro tipo
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE LOG_AUDITORIA_FRETE_EXPRESSO IS 'Trilha de auditoria imutável para eventos críticos no fluxo do Frete Expresso.';
COMMENT ON COLUMN LOG_AUDITORIA_FRETE_EXPRESSO.ID_FRETE IS 'ID do frete associado.';
COMMENT ON COLUMN LOG_AUDITORIA_FRETE_EXPRESSO.USUARIO_ACAO IS 'Usuário ou sistema que originou a ação.';
COMMENT ON COLUMN LOG_AUDITORIA_FRETE_EXPRESSO.DESCRICAO_ACAO IS 'Descrição da ação ou transição de status.';
COMMENT ON COLUMN LOG_AUDITORIA_FRETE_EXPRESSO.DATA_HORA_EVENTO IS 'Timestamp exato da ocorrência do evento (UTC-3), com precisão de milissegundos.';
COMMENT ON COLUMN LOG_AUDITORIA_FRETE_EXPRESSO.FUSO_HORARIO IS 'Fuso horário registrado para o evento.';
/

-- Tabela: ANEXOS_COMPROVACAO
-- Armazena referências para arquivos anexados (ex: comprovantes de custos extras).
DECLARE
    table_exists EXCEPTION;
    PRAGMA EXCEPTION_INIT(table_exists, -955);
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE ANEXOS_COMPROVACAO (
        ID VARCHAR2(36) PRIMARY KEY DEFAULT SYS_GUID(),
        ID_ENTIDADE VARCHAR2(50) NOT NULL, -- ID da entidade pai (Frete, OCORRENCIA_CUSTO_EXTRA, etc.)
        TIPO_ENTIDADE VARCHAR2(50) NOT NULL, -- Tipo da entidade pai (ex: ''FRETE'', ''OCORRENCIA_CUSTO_EXTRA'')
        NOME_ARQUIVO VARCHAR2(255) NOT NULL,
        URL_ARQUIVO VARCHAR2(4000) NOT NULL, -- URL ou path para o arquivo armazenado
        TAMANHO_MB NUMBER(10) NOT NULL, -- Tamanho do arquivo em MB
        TIPO_MIME VARCHAR2(100),
        UPLOADED_BY VARCHAR2(50),
        CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
    WHEN table_exists THEN
        NULL;
END;
/
COMMENT ON TABLE ANEXOS_COMPROVACAO IS 'Armazena metadados de arquivos anexados (ex: comprovantes).';
/

-- =========================================================
-- 3. Alterações em Tabelas Existentes (Conceitual)
--    Assumindo tabelas 'FRETE' e 'COTACAO_TRANSPORTADOR'
--    já existem no schema.
-- =========================================================

-- ALTER TABLE para 'FRETE' (tabela de demandas/solicitações de frete)
-- Adiciona a coluna para aglutinação.
DECLARE
    col_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'FRETE' AND COLUMN_NAME = 'ID_AGLUTINADOR';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE FRETE ADD (ID_AGLUTINADOR VARCHAR2(36))';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN FRETE.ID_AGLUTINADOR IS ''ID do agrupador de fretes, se a demanda estiver aglutinada.''';
    END IF;
END;
/

-- ALTER TABLE para 'COTACAO_TRANSPORTADOR' (tabela de propostas do fornecedor)
-- Adiciona campos para desdobramento financeiro e prazos operacionais.
DECLARE
    col_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'COTACAO_TRANSPORTADOR' AND COLUMN_NAME = 'VALOR_COTACAO_INDIVIDUAL';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD (VALOR_COTACAO_INDIVIDUAL NUMBER(18, 2) DEFAULT 0.00 NOT NULL)';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN COTACAO_TRANSPORTADOR.VALOR_COTACAO_INDIVIDUAL IS ''Valor da cotação individual (Preço All-In) para esta perna do frete.''';
    END IF;

    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'COTACAO_TRANSPORTADOR' AND COLUMN_NAME = 'VALOR_COTACAO_COMPLEMENTAR';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD (VALOR_COTACAO_COMPLEMENTAR NUMBER(18, 2))';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN COTACAO_TRANSPORTADOR.VALOR_COTACAO_COMPLEMENTAR IS ''Valor complementar da cotação para cenários de aglutinação.''';
    END IF;

    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'COTACAO_TRANSPORTADOR' AND COLUMN_NAME = 'TRANSIT_TIME_COLETA';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD (TRANSIT_TIME_COLETA NUMBER(5))';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN COTACAO_TRANSPORTADOR.TRANSIT_TIME_COLETA IS ''Tempo de trânsito para coleta em horas.''';
    END IF;

    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'COTACAO_TRANSPORTADOR' AND COLUMN_NAME = 'TRANSIT_TIME_ENTREGA';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD (TRANSIT_TIME_ENTREGA NUMBER(5))';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN COTACAO_TRANSPORTADOR.TRANSIT_TIME_ENTREGA IS ''Tempo de trânsito para entrega em horas.''';
    END IF;

    SELECT COUNT(*) INTO col_exists FROM USER_TAB_COLUMNS WHERE TABLE_NAME = 'COTACAO_TRANSPORTADOR' AND COLUMN_NAME = 'STATUS_REGISTRO_ATIVO';
    IF col_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD (STATUS_REGISTRO_ATIVO NUMBER(1) DEFAULT 1 NOT NULL)';
        EXECUTE IMMEDIATE 'COMMENT ON COLUMN COTACAO_TRANSPORTADOR.STATUS_REGISTRO_ATIVO IS ''Flag para controle de registros ativos para a unique constraint (0=Inativo, 1=Ativo).''';
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD CONSTRAINT CHK_COTACAO_STATUS_ATIVO CHECK (STATUS_REGISTRO_ATIVO IN (0,1))';
    END IF;
END;
/

-- Adiciona Unique Constraint na tabela 'COTACAO_TRANSPORTADOR'
DECLARE
    constraint_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO constraint_exists FROM USER_CONSTRAINTS WHERE CONSTRAINT_NAME = 'UQ_COTACAO_TRANSPORTADOR_DEMANDA_ATIVO';
    IF constraint_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE COTACAO_TRANSPORTADOR ADD CONSTRAINT UQ_COTACAO_TRANSPORTADOR_DEMANDA_ATIVO UNIQUE (ID_DEMANDA, ID_TRANSPORTADOR, STATUS_REGISTRO_ATIVO)';
    END IF;
END;
/


-- =========================================================
-- 4. Índices (Otimização de Busca)
-- =========================================================

-- Índices para chaves estrangeiras (melhora performance de JOINs)
-- Por favor, ajuste as referências de tabela e coluna conforme seu schema real.
-- CREATE INDEX IDX_MATRIZ_APROVACAO_FRETE_UNIT_CD ON MATRIZ_APROVACAO_FRETE (UNIT_CD);
-- CREATE INDEX IDX_MATRIZ_APROVACAO_FRETE_ID_USER ON MATRIZ_APROVACAO_FRETE (ID_USUARIO_APROVADOR);
-- CREATE INDEX IDX_OCORRENCIA_CUSTO_EXTRA_ID_FRETE ON OCORRENCIA_CUSTO_EXTRA (ID_FRETE);
-- CREATE INDEX IDX_OCORRENCIA_CUSTO_EXTRA_ID_TRANSP ON OCORRENCIA_CUSTO_EXTRA (ID_TRANSPORTADOR);
-- CREATE INDEX IDX_OCORRENCIA_CUSTO_EXTRA_ID_TIPO ON OCORRENCIA_CUSTO_EXTRA (TIPO_OCORRENCIA_ID);
-- CREATE INDEX IDX_LOG_AUDITORIA_FRETE_EXPRESSO_ID_F ON LOG_AUDITORIA_FRETE_EXPRESSO (ID_FRETE);
CREATE INDEX IDX_LOG_AUDITORIA_FRETE_EXPRESSO_DHE ON LOG_AUDITORIA_FRETE_EXPRESSO (DATA_HORA_EVENTO DESC);
CREATE INDEX IDX_ANEXOS_COMPROVACAO_ID_ENT_TIPO ON ANEXOS_COMPROVACAO (ID_ENTIDADE, TIPO_ENTIDADE);

-- Índices para busca geográfica (comentado, pois depende de implementação de colunas de lat/long e talvez Oracle Spatial)
-- Se a tabela FRETE tiver colunas como LATITUDE, LONGITUDE, use índices espaciais se o Oracle Spatial estiver habilitado.
-- Ex: CREATE INDEX IDX_FRETE_ORIGEM_GEOSPATIAL ON FRETE (ORIGEM_GEOMETRIA) INDEXTYPE IS MDSYS.SPATIAL_INDEX;


-- =========================================================
-- 5. Data Seed (Valores Padrão/Default)
-- =========================================================

-- Valores Padrão para CONFIGURACAO_FRETE_EXPRESSO
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'raio_max_aglutinacao_km', '150.00', 'NUMERIC', 'Raio máximo em KM para aglutinação de fretes.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'raio_max_aglutinacao_km');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'peso_preco_percentual', '60', 'INTEGER', 'Peso percentual para o critério de preço no cálculo do score de Melhor Oferta.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'peso_preco_percentual');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'peso_tempo_percentual', '40', 'INTEGER', 'Peso percentual para o critério de tempo no cálculo do score de Melhor Oferta.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'peso_tempo_percentual');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'sla_expiracao_cotacao_min', '40', 'INTEGER', 'SLA de expiração da cotação em minutos úteis.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'sla_expiracao_cotacao_min');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'sla_prorrogacao_cotacao_min', '30', 'INTEGER', 'SLA de prorrogação da cotação em minutos úteis.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'sla_prorrogacao_cotacao_min');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'sla_escalonamento_alcada_min', '30', 'INTEGER', 'SLA de escalonamento da alçada em minutos úteis.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'sla_escalonamento_alcada_min');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'margem_tolerancia_duplo_check', '10.00', 'NUMERIC', 'Margem de tolerância percentual para o duplo-check financeiro.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'margem_tolerancia_duplo_check');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'janela_historico_duplo_check_dias', '180', 'INTEGER', 'Número de dias no histórico para cálculo do duplo-check.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'janela_historico_duplo_check_dias');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'limite_max_upload_mb', '25', 'INTEGER', 'Limite máximo de MB para upload de arquivos.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'limite_max_upload_mb');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'inicio_expediente_util', '07:00:00', 'TIME', 'Hora de início do expediente útil (HH:MM:SS).' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'inicio_expediente_util');
INSERT INTO CONFIGURACAO_FRETE_EXPRESSO (CHAVE, VALOR, TIPO_DADO, DESCRICAO)
SELECT 'fim_expediente_util', '20:00:00', 'TIME', 'Hora de fim do expediente útil (HH:MM:SS).' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CONFIGURACAO_FRETE_EXPRESSO WHERE CHAVE = 'fim_expediente_util');
/

-- Valores Padrão para TIPO_OCORRENCIA_CUSTO_EXTRA
INSERT INTO TIPO_OCORRENCIA_CUSTO_EXTRA (ID, NOME, DESCRICAO)
SELECT SYS_GUID(), 'HORAS_PARADAS', 'Custo adicional por horas paradas.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM TIPO_OCORRENCIA_CUSTO_EXTRA WHERE NOME = 'HORAS_PARADAS');
INSERT INTO TIPO_OCORRENCIA_CUSTO_EXTRA (ID, NOME, DESCRICAO)
SELECT SYS_GUID(), 'DIARIA', 'Custo adicional por diária.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM TIPO_OCORRENCIA_CUSTO_EXTRA WHERE NOME = 'DIARIA');
INSERT INTO TIPO_OCORRENCIA_CUSTO_EXTRA (ID, NOME, DESCRICAO)
SELECT SYS_GUID(), 'DESCARGA', 'Custo adicional por descarga.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM TIPO_OCORRENCIA_CUSTO_EXTRA WHERE NOME = 'DESCARGA');
INSERT INTO TIPO_OCORRENCIA_CUSTO_EXTRA (ID, NOME, DESCRICAO)
SELECT SYS_GUID(), 'TROCA_VEICULO', 'Custo adicional por troca de veículo.' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM TIPO_OCORRENCIA_CUSTO_EXTRA WHERE NOME = 'TROCA_VEICULO');
/

```

---

## 2. Mapeamento de Endpoints da API (Java 17 / Spring Boot 3)

O design da API segue a arquitetura **RESTful** documentada via **OpenAPI 3 / Swagger**. Utiliza os recursos nativos do **Java 17** (como `record` para DTOs) e **Spring Boot 3** (Spring Security 6 com checagem JWT).

### 2.1. Métodos Principais de Negócio

#### 2.1.1. `GET /api/frete-expresso/painel` (Filtros e Painel de Monitoramento da ILC)
* **Responsabilidade:** Lista paginada e filtrada de todas as solicitações para a Torre de Controle da ILC (Visão Interna).
* **Firma do Controller:**
  ```java
  @GetMapping("/frete-expresso/painel")
  @PreAuthorize("hasAnyRole('ROLE_ILC', 'ROLE_APROVADOR')")
  public ResponseEntity<Page<FretePainelResponseDTO>> listarPainel(
      @RequestParam(required = false) String id,
      @RequestParam(required = false) String cliente,
      @RequestParam(required = false) String transportador,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
      // Implementação com checagem de Unit_CD do usuário para segurança de dados
  }
  ```
* **Payload de Entrada (DTO):** Query params.
* **Segurança e Anti-IDOR (Spring Security 6):**
  * O interceptador JWT extrai o contexto do usuário logado. Se for um aprovador, a API injeta automaticamente o filtro de `unit_cd` no repositório JPA do Spring Boot, impedindo que aprovadores de uma filial vejam fretes de outra.

#### 2.1.2. `GET /api/frete-expresso/pedido/{id}` (Step 05 - Detalhes Fiscais)
* **Responsabilidade:** Retorna os metadados do pedido e da ordem de coleta gerados após a aprovação da cotação no Step 05.
* **Firma do Controller:**
  ```java
  @GetMapping("/frete-expresso/pedido/{id}")
  @PreAuthorize("hasAnyRole('ROLE_ILC', 'ROLE_PLANEJADOR', 'ROLE_TRANSPORTADOR')")
  public ResponseEntity<PedidoFreteResponseDTO> obterPedido(@PathVariable String id) {
      // Regra de segurança Anti-IDOR executada no Service
  }
  ```
* **Payload de Saída (Java 17 Record):**
  ```java
  public record PedidoFreteResponseDTO(
      String idFrete,
      String numeroPedido,
      String ordemColeta,
      BigDecimal valorConsolidado,
      String statusIntegracao
  ) {}
  ```
* **Segurança e Anti-IDOR (Spring Security 6):**
  * Se o usuário conectado tiver perfil `ROLE_TRANSPORTADOR`, o serviço busca o `Supplier_ID` do token de autenticação (JWT) e valida contra o banco se a cotação ganhadora pertence a este CNPJ. Se divergir, retorna `403 Forbidden` impedindo a interceptação de dados de concorrência.

#### 2.1.3. `GET /api/frete-expresso/resumo/{id}` (Step 07 - Resumo Read-Only)
* **Responsabilidade:** Fornece o payload completo de consolidação da jornada do frete (bloco de 1 a 6) para visualização Read-Only no Step 07.
* **Firma do Controller:**
  ```java
  @GetMapping("/frete-expresso/resumo/{id}")
  @PreAuthorize("hasAnyRole('ROLE_ILC', 'ROLE_APROVADOR', 'ROLE_TRANSPORTADOR')")
  public ResponseEntity<FreteResumoResponseDTO> obterResumo(@PathVariable String id) { ... }
  ```
* **Segurança e Anti-IDOR:**
  * O Service aplica um cruzamento de segurança: se for perfil transportador, valida se o `Supplier_ID` coincide com o transportador executor do frete.

#### 2.1.4. `GET /api/transportador/cotaques` (Portal do Transportador)
* **Responsabilidade:** Retorna a listagem de cotações pendentes de resposta direcionadas especificamente à transportadora conectada.
* **Firma do Controller:**
  ```java
  @GetMapping("/transportador/cotaques")
  @PreAuthorize("hasRole('ROLE_TRANSPORTADOR')")
  public ResponseEntity<List<CotacaoOportunidadeDTO>> listarOportunidades() {
      // Recupera o Supplier_ID (CNPJ) diretamente do token JWT
      String supplierId = SecurityContextHolder.getContext().getAuthentication().getName();
      return ResponseEntity.ok(cotacaoService.buscarOportunidadesAtivas(supplierId));
  }
  ```
* **Segurança e Anti-IDOR:**
  * **Blindagem Total:** O transportador não envia o seu ID de fornecedor nos parâmetros ou cabeçalhos. O `Supplier_ID` é extraído fisicamente do token JWT assinado pela API no login. Isso anula a vulnerabilidade IDOR de listagem.

#### 2.1.5. `POST /api/transportador/submeter-lance` (Step 02 - Submissão de Cotação)
* **Responsabilidade:** Persiste a proposta financeira e prazos (SLA) do transportador para uma demanda do leilão (Step 02).
* **Firma do Controller:**
  ```java
  @PostMapping("/transportador/submeter-lance")
  @PreAuthorize("hasRole('ROLE_TRANSPORTADOR')")
  public ResponseEntity<Void> submeterLance(@Valid @RequestBody SubmissaoLanceDTO dto) { ... }
  ```
* **Payload de Entrada (Java 17 Record):**
  ```java
  public record SubmissaoLanceDTO(
      @NotBlank String idDemanda,
      @NotNull @Positive BigDecimal valorCotacaoIndividual,
      BigDecimal valorCotacaoComplementar, // Nullable se individual
      @NotNull @Positive Integer transitTimeColeta,
      @NotNull @Positive Integer transitTimeEntrega,
      List<String> urlsAnexos
  ) {}
  ```
* **Segurança e Anti-IDOR:**
  * O endpoint rejeita o upload de arquivos cujo tamanho supere 25MB (através da leitura do cabeçalho `Content-Length` mapeada em nível de Gateway/Servlet Filter, retornando `413 Payload Too Large` ou `422 Unprocessable Entity`).
  * A API cruza a cotação com a unique constraint do banco para evitar lances repetidos (*idempotência*).

---

### 2.2. Endpoints de Governança, Aprovação e Exceções (Deduzidos)

#### 2.2.1. Aglutinação de Demandas (Step 01 - Time ILC)
* `POST /api/frete-expresso/aglutinar`
  * **Responsabilidade:** Agrupa múltiplos fretes compatíveis no Step 01 sob um `id_aglutinador`.
  * **DTO Entrada:** `public record AglutinarRequestDTO(List<String> idDemandas, String idVeiculo) {}`
  * **Segurança:** Restrito a `ROLE_ILC`.
  * **Validação Volumétrica:** O veículo selecionado (`idVeiculo`) deve possuir uma volumetria máxima (m³) igual ou maior à soma das volumetrias de todas as demandas agrupadas (`idDemandas`). Caso o volume consolidado exceda a capacidade do veículo, o backend retorna `400 Bad Request`.

* `POST /api/frete-expresso/desaglutinar/{idFrete}`
  * **Responsabilidade:** Desfaz a aglutinação mantendo o valor individual intacto e zerando o adicional (RN07).
  * **Segurança:** Restrito a `ROLE_ILC`.

* `GET /api/frete-expresso/sugestoes-aglutinacao`
  * **Responsabilidade:** Retorna os fretes compatíveis num raio de 150km.
  * **Segurança:** Restrito a `ROLE_ILC`.

#### 2.2.2. Aprovações da Matriz (Step 03 - Aprovador)
* `POST /api/frete-expresso/pedido/{id}/aprovar`
  * **Responsabilidade:** Registra a aprovação na sequência vigente na Matriz de Alçadas.
  * **Segurança:** Restrito a `ROLE_APROVADOR`. O backend aplica um `SELECT ... FOR UPDATE` (lock pessimista) na linha do frete no OracleDB para garantir integridade e resolver por *First-In*, retornando erro controlado caso outro aprovador do pool de tempo já tenha tomado a ação no mesmo milissegundo.

#### 2.2.3. Lançamento e Tratativa de Custos Extra (Step 06 - Transportador / Aprovador)
* `POST /api/transportador/fretes/{idFrete}/custo-extra`
  * **Responsabilidade:** Transportador lança ocorrências de custos complementares em rota.
  * **DTO Entrada:** `public record CustoExtraRequestDTO(String tipoOcorrenciaId, BigDecimal valorDelta, String justificativa) {}`
  * **Segurança:** Apenas `ROLE_TRANSPORTADOR`. Valida que o tamanho do anexo no corpo da requisição não estoura 25MB.
* `POST /api/frete-expresso/custos-extra/{idOcorrencia}/aprovar`
  * **Responsabilidade:** Aprovador do cliente delibera a aprovação do valor delta solicitado, ativando isoladamente a Matriz de Alçadas.
  * **Segurança:** Apenas `ROLE_APROVADOR`.

#### 2.2.4. Cancelamento Global em Cascata (Step 01 ao 07 - ILC / Cliente)
* `POST /api/fretes/{idFrete}/cancelar`
  * **Responsabilidade:** Realiza o cancelamento global do frete expresso em cascata (cancelando a demanda mãe e todas as cotações ativas associadas, independente de seus status individuais).
  * **Segurança:** Apenas usuários autorizados.

---

## 3. Mapeamento Frontend (Angular + M3)

Abaixo estão detalhados os impactos visuais, a lógica reativa com `Reactive Forms` e os componentes onde aplicaremos as regras de negócio de UI no protótipo em Angular.

### 3.1. Step 01 e Painel Administrativo

#### A. Controle de Fluxo Reativo
* **Habilitação Condicional do Botão Avançar:** O botão "Avançar" no Step 01 permanece desabilitado até que a solicitação seja gerada/enviada (`solicitacaoGerada === true`).
* **Botão Dinâmico Enviar/Salvar:** O botão de ação principal exibe "Enviar" quando a solicitação for nova (`!solicitacaoGerada`). Uma vez que a solicitação é gerada/enviada, o botão passa a se chamar "Salvar".
* **Notificação ao Time Operacional ILC:** Toda e qualquer alteração realizada e salva no Step 01 (Solicitação) dispara uma notificação em tempo real ao time operacional ILC por meio do hub de mensageria/e-mail para sincronismo operacional.
* **Componentes Utilizados:**
  * `permitirAgrupamento`: Usaremos o `mat-slide-toggle` (Material 3 switch component) inicializado com valor `true` (padrão) no `FormBuilder`.
  * `unitCd`: Usaremos `mat-select` ou `mat-autocomplete` integrado ao serviço de busca cadastral do cliente.
* **Travas de Interface (Debounce):**
  * Para o botão de "Vincular Frete" no grid de aglutinação, usaremos RxJS para interceptar os cliques do operador de forma reativa:
  ```typescript
  // Prevenção de concorrência na UI contra duplo clique rápido (CA06)
  import { Subject } from 'rxjs';
  import { debounceTime, throttleTime } from 'rxjs/operators';

  this.clickVincularSubject
    .pipe(throttleTime(2000)) // Ignora novos cliques por 2 segundos após a primeira requisição
    .subscribe(() => this.executarVinculacao());
  ```

#### B. Tela Administrativa (Matriz de Alçadas) - Validação de Gaps e Overlaps
* Implementaremos um validator customizado no FormGroup da lista de faixas da matriz para validar a conformidade matemática da **RN26**:
```typescript
import { AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

export function validadorGapsMatriz(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const formArray = control as FormArray;
    const faixas = formArray.value.sort((a, b) => a.sequencia - b.sequencia);
    
    for (let i = 1; i < faixas.length; i++) {
      const anterior = faixas[i - 1];
      const atual = faixas[i];
      
      const limiteEsperado = Number(anterior.valor_maximo) + 0.01;
      if (Number(atual.valor_minimo) !== limiteEsperado) {
        return { 'gapMatriz': { sequenciaError: atual.sequencia, esperado: limiteEsperado } };
      }
    }
    return null;
  };
}
```
* **Comportamento UI:** Se o `FormArray` retornar erro `'gapMatriz'`, as bordas dos inputs correspondentes serão estilizadas com a classe CSS `.gap-error` (borda vermelha de 2px) e o botão "Salvar" será programaticamente desabilitado: `[disabled]="matrizForm.invalid"`.

---

### 3.2. Step 02 e Step 06 (Portal do Transportador)

#### A. Restrição de Caracteres Decimais no Transit Time (Apenas Inteiros)
* Utilizaremos uma diretiva personalizada no input do Transit Time (coleta/entrega) para limpar qualquer caractere não numérico digitado e evitar pontos e vírgulas:
```typescript
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyIntegerNumbers]'
})
export class OnlyIntegerNumbersDirective {
  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initialValue = event.target.value;
    event.target.value = initialValue.replace(/[^0-9]/g, ''); // Limpa pontos, vírgulas e letras
    if (initialValue !== event.target.value) {
      event.stopPropagation();
    }
  }
}
```

#### B. Desdobramento Dinâmico de Inputs e Cálculo Reativo (All-In)
* Na tela de inserção da cotação (`edicao-frete-view`), se a demanda for aglutinada (`id_aglutinador !== null`), o formulário exibirá condicionalmente dois blocos de preenchimento (`valor_cotacao_individual` e `valor_cotacao_complementar`).
* A soma reativa e atualização do All-In em tempo real no HTML é feita utilizando o operador `valueChanges` do `Reactive Forms`:
```typescript
this.cotacaoForm.valueChanges.subscribe(val => {
  const individual = Number(val.valor_cotacao_individual || 0);
  const complementar = Number(val.valor_cotacao_complementar || 0);
  this.valorTotalAllIn = individual + complementar;
  
  // Atualiza o controle apenas para exibição em tela (Read-Only)
  this.cotacaoForm.get('valor_total_all_in')?.setValue(this.valorTotalAllIn, { emitEvent: false });
});
```

---

### 3.3. Componente de Upload de Anexos (Step 02 e 06)

* Para tratar uploads de comprovantes no frontend e barrar arquivos maiores que **25MB** antes da submissão à API (prevenindo desperdício de banda):
```typescript
onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB em Bytes

  if (file.size > maxSizeBytes) {
    // Interrompe o processamento na interface e limpa o input
    input.value = ''; 
    this.mostrarToastErro(`O arquivo "${file.name}" excede o limite permitido de 25MB`);
    return;
  }
  
  // Prossegue com o upload
  this.uploadArquivo(file);
}

private mostrarToastErro(mensagem: string) {
  this.snackBar.open(mensagem, 'Fechar', {
    duration: 5000,
    panelClass: ['premium-toast-error'], // Classe CSS personalizada para o Toast Vermelho (Material 3)
    horizontalPosition: 'end',
    verticalPosition: 'top'
  });
}
```

---

### 3.4. Bloqueio de Interface (Lockdown de Dados)

Nas transições de fluxo para os **Steps 04, 05 e 07**, a interface deve garantir imutabilidade total dos dados.

#### Lógica Angular Aplicada
1. **Desativação Completa do Formulário:** Ao carregar a tela nestas etapas, a lógica do component executa o congelamento reativo:
   ```typescript
   if (this.currentStep === 4 || this.currentStep === 5 || this.currentStep === 7) {
     this.freteForm.disable(); // Desabilita todos os inputs e impede novas escritas
   }
   ```
2. **Campos Específicos como Texto Estático:** Em vez de renderizar componentes de inputs desabilitados (que podem ter contraste visual ruim para leitura), utilizaremos a diretiva `*ngIf` para renderizar apenas texto estático de leitura rápida em formato HTML estruturado:
   ```html
   <!-- Se estiver em lockdown, exibe apenas o valor textual legível -->
   <ng-container *ngIf="isLockdown; else formTemplate">
     <div class="info-item">
       <span class="label">Valor Total All-In</span>
       <span class="value">{{ valorTotalAllIn | currency:'BRL' }}</span>
     </div>
   </ng-container>
   
   <ng-template #formTemplate [formGroup]="cotacaoForm">
     <mat-form-field appearance="outline">
       <mat-label>Valor Cotação Individual</mat-label>
       <input matInput type="number" formControlName="valor_cotacao_individual">
     </mat-form-field>
   </ng-template>
   ```

---

### 3.5. Resolução de Diferenças de Fuso Horário e Simulação de SLA
* **Parser de Data Local:** Utiliza inicialização numérica (`new Date(ano, mes, dia)`) em vez de parsing de strings ISO em UTC para evitar a perda de 1 dia na renderização local dos Datepickers.
* **Arredondamento por Minuto:** Para a simulação física de trânsito útil, as datas e prazos são normalizados por minuto (`getTime() / 60000`) para evitar rejeições de SLA decorrentes de diferenças de milissegundos.
* **Deduplicação de Coletas:** Demandas agrupadas no mesmo fornecedor são consolidadas como uma única parada na simulação física do roteiro de viagem, prevenindo logs de tráfego/espera redundantes.
* **Folga no Recomendador:** O motor de sugestão de janelas aplica um buffer de **3 horas** adicionais para fim de coletas e SLAs de entrega para garantir viabilidade operacional realista.
* **Ações Disponíveis Pós-Envio:** Os botões "Declinar", "Cobrança Extra" e "Solicitar Correção" permanecem ativos após a submissão da cotação, sendo desativados somente se a solicitação estiver em status `"Cancelado"` ou `"Finalizado"`.

---

## 4. Conclusão e Critérios de Aceite (Definition of Done)

Este mapeamento técnico garante que:
* **O banco de dados OracleDB** rejeitará lances concorrentes duplicados (idempotência física), indexará consultas de performance do duplo-check de 180 dias e suportará a modelagem de janelas e custos operacionais complementares.
* **A API Java 17 / Spring Boot 3** validará a consistência do `Supplier_ID` a partir do JWT para blindar os dados logísticos contra ataques de IDOR.
* **A interface Angular + M3** se comportará de maneira reativa, bloqueando gaps na matriz de alçadas administrativas, aplicando sugestões viáveis com buffer e oferecendo suporte a correções e extras pós-submissão.
