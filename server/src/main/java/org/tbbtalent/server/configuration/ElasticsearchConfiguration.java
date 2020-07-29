/*
 * Copyright (c) 2020 Talent Beyond Boundaries. All rights reserved.
 */

package org.tbbtalent.server.configuration;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.RestClients;
import org.springframework.data.elasticsearch.config.AbstractElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Based on https://docs.spring.io/spring-data/elasticsearch/docs/current/reference/html/#elasticsearch.clients.rest
 *
 * @author John Cameron
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "org.tbbtalent.server.repository.es")
@ComponentScan(basePackages = { "org.tbbtalent.server.service.es" })
public class ElasticsearchConfiguration extends AbstractElasticsearchConfiguration {

    @Value("${spring.elasticsearch.rest.uris}")
    private List<String> uris;
    @Value("${spring.elasticsearch.rest.username}")
    private String username;
    @Value("${spring.elasticsearch.rest.password}")
    private String password;
    
    @Override
    @Bean
    public RestHighLevelClient elasticsearchClient() {
        try {
            if (uris != null && uris.size() > 0) {
                URI uri = new URI(uris.get(0));
                String hostAndPort = uri.getAuthority();
                String protocol = uri.getScheme();
                boolean useSsl = "https".equals(protocol);
                
                ClientConfiguration.MaybeSecureClientConfigurationBuilder x
                        = ClientConfiguration.builder().connectedTo(hostAndPort);

                if (useSsl) {
                    x = (ClientConfiguration.MaybeSecureClientConfigurationBuilder) 
                            x.usingSsl();
                }
                
                if (username != null && username.length() > 0) {
                    x = (ClientConfiguration.MaybeSecureClientConfigurationBuilder) 
                            x.withBasicAuth(username, password);                    
                }
                ClientConfiguration clientConfiguration = x.build();

                return RestClients.create(clientConfiguration).rest();
            } else {
                throw new RuntimeException("Missing Elasticsearch URL");
            }
        } catch (URISyntaxException e) {
            throw new RuntimeException("Badly formatted Elasticsearch URL: " + uris, e);
        }
    }
}