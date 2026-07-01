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
