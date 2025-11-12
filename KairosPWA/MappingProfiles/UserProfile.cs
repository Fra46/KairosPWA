using AutoMapper;
using KairosPWA.DTOs;
using KairosPWA.Models;

namespace KairosPWA.MappingProfiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.RolName, opt => opt.MapFrom(src => src.Rol.Name));
            CreateMap<UserDTO, User>()
                .ForMember(dest => dest.Rol, opt => opt.Ignore());
            CreateMap<UserCreateDTO, User>()
                .ForMember(dest => dest.Rol, opt => opt.Ignore());
        }
    }
}
