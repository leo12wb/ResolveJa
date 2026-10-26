package io.fixfirst.resolveja.security;

import io.fixfirst.resolveja.repository.PrestadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PrestadorRepository prestadorRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return prestadorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Prestador não encontrado: " + email));
    }
}
